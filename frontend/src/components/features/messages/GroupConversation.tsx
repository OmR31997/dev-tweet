"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  useArchiveGroupChat,
  useClearGroupChat,
  useClearGroupChatForEveryone,
  useConversations,
  useDeleteMessageForEveryone,
  useDeleteMessageForMe,
  useDeleteMessages,
  useForwardMessages,
  useGroupConversation,
  useGroupMessages,
  useMarkGroupRead,
  useSendGroupMessage,
  useToggleMessageReaction,
  useUnarchiveGroupChat,
  useUsers,
  type Message,
  type ReplyTarget,
  type SendGroupMessageDto,
} from "@/lib/api";
import { useAuthUser } from "@/store";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Forward,
  ImageIcon,
  Info,
  MoreVertical,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatMessageList } from "./ChatMessageList";
import { ForwardMessageDialog } from "./ForwardMessageDialog";
import { GroupInfoPanel } from "./GroupInfoPanel";
import { MediaFilesPanel } from "./MediaFilesPanel";
import { MessageComposer, type ComposerSendPayload } from "./MessageComposer";
import { buildMessagesFromComposerPayload } from "./composer-send.utils";
import { useMessageSelection } from "./useMessageSelection";

export function GroupConversation({
  conversationId,
}: {
  conversationId: string;
}) {
  const t = useTranslations("Chat");
  const router = useRouter();
  const me = useAuthUser();
  const users = useUsers();
  const group = useGroupConversation(conversationId);
  const archivedGroups = useConversations(true);
  const archiveGroup = useArchiveGroupChat();
  const unarchiveGroup = useUnarchiveGroupChat();
  const messages = useGroupMessages(conversationId);
  const sendMessage = useSendGroupMessage(conversationId);
  const markRead = useMarkGroupRead(conversationId);
  const clearChat = useClearGroupChat(conversationId);
  const clearChatForEveryone = useClearGroupChatForEveryone(conversationId);
  const toggleReaction = useToggleMessageReaction();
  const deleteMessages = useDeleteMessages();
  const deleteMessageForMe = useDeleteMessageForMe();
  const deleteMessageForEveryone = useDeleteMessageForEveryone();
  const forwardMessages = useForwardMessages();
  const selection = useMessageSelection();

  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidePanel, setSidePanel] = useState<"none" | "info" | "media">("none");
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmClearForEveryone, setConfirmClearForEveryone] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const user of users.data ?? []) {
      map.set(user.id, user.displayName);
    }
    if (me) map.set(me.id, me.displayName);
    return map;
  }, [users.data, me]);

  const items = messages.data ?? [];
  const groupData = group.data;
  const isArchived = (archivedGroups.data ?? []).some(
    (item) => item.id === conversationId,
  );

  useEffect(() => {
    if (conversationId) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, items.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items.length, selection.selectionMode]);

  const onSend = (payload: ComposerSendPayload) => {
    if (payload.messageType === "text" && !payload.content && !payload.attachments?.length) {
      return;
    }
    const messages = buildMessagesFromComposerPayload<SendGroupMessageDto>(
      payload,
      {},
      replyTo?.id,
    );
    for (const message of messages) {
      if (message.messageType === "text" && !message.content) continue;
      sendMessage.mutate(message);
    }
    setDraft("");
    setReplyTo(null);
  };

  const handleReply = (message: Message) => {
    setReplyTo({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderName:
        message.senderId === me?.id
          ? "You"
          : (nameById.get(message.senderId) ?? "User"),
    });
  };

  const deleteSelected = () => {
    const ids = Array.from(selection.selectedIds);
    deleteMessages.mutate(
      { messageIds: ids, forEveryone: false },
      {
        onSuccess: () => selection.exitSelection(),
        onSettled: () => setConfirmDelete(false),
      },
    );
  };

  const isGroupAdmin = Boolean(
    groupData?.admins.includes(me?.id ?? ""),
  );

  if (!groupData) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {group.isLoading ? t("loadingGroup") : t("groupNotFound")}
      </div>
    );
  }

  return (
    <div className="flex h-full min-w-0">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="relative z-30 flex shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        {selection.selectionMode ? (
          <>
            <button type="button" onClick={selection.exitSelection}>
              <X className="size-5" />
            </button>
            <span className="text-sm font-semibold">
              {selection.selectedIds.size} selected
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                disabled={selection.selectedIds.size === 0}
                onClick={() =>
                  selection.openForward(Array.from(selection.selectedIds))
                }
                className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent disabled:opacity-40"
              >
                <Forward className="size-5" />
              </button>
              <button
                type="button"
                disabled={selection.selectedIds.size === 0}
                onClick={() => setConfirmDelete(true)}
                className="grid size-9 place-items-center rounded-full text-destructive hover:bg-accent disabled:opacity-40"
              >
                <Trash2 className="size-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link href="/messages" className="md:hidden">
              <ArrowLeft className="size-5" />
            </Link>

            <button
              type="button"
              onClick={() =>
                setSidePanel((panel) => (panel === "info" ? "none" : "info"))
              }
              className="flex min-w-0 flex-1 select-none items-center gap-3 border-none bg-transparent p-0 text-left outline-none focus:outline-none"
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Users className="size-4" />
              </div>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">
                  {groupData.title || "Untitled group"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {groupData.participants.length} participants
                </span>
              </span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((o) => !o);
                }}
                aria-label="Group options"
                className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent"
              >
                <MoreVertical className="size-5" />
              </button>
              {menuOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setSidePanel("media");
                      }}
                      className="flex w-full items-center gap-3 border-t border-border px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      <ImageIcon className="size-4" />
                      Media &amp; Files
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setSidePanel("info");
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      <Info className="size-4" />
                      Group info
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        selection.enterSelection();
                      }}
                      className="flex w-full items-center gap-3 border-t border-border px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      Select messages
                    </button>
                    {isArchived ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          unarchiveGroup.mutate(conversationId);
                        }}
                        className="flex w-full items-center gap-3 border-t border-border px-3 py-2.5 text-sm hover:bg-accent"
                      >
                        <ArchiveRestore className="size-4" />
                        Unarchive chat
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          archiveGroup.mutate(conversationId, {
                            onSuccess: () => router.push("/messages"),
                          });
                        }}
                        className="flex w-full items-center gap-3 border-t border-border px-3 py-2.5 text-sm hover:bg-accent"
                      >
                        <Archive className="size-4" />
                        Archive chat
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setConfirmClear(true);
                      }}
                      className="flex w-full items-center gap-3 border-t border-border px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      <Trash2 className="size-4" />
                      Clear chat
                    </button>
                    {isGroupAdmin ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmClearForEveryone(true);
                        }}
                        className="flex w-full items-center gap-3 border-t border-border px-3 py-2.5 text-sm text-destructive hover:bg-accent"
                      >
                        <Trash2 className="size-4" />
                        Delete for everyone
                      </button>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </>
        )}
      </header>

      <ConfirmDialog
        open={confirmClear}
        title="Clear group chat?"
        message="Messages will be removed from this chat on your device only. Other members will still see them."
        confirmLabel="Clear for me"
        cancelLabel="Cancel"
        destructive
        busy={clearChat.isPending}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() =>
          clearChat.mutate(undefined, {
            onSettled: () => setConfirmClear(false),
          })
        }
      />

      <ConfirmDialog
        open={confirmClearForEveryone}
        title="Delete group chat for everyone?"
        message="This permanently deletes all messages in this group for every member."
        confirmLabel="Delete for everyone"
        cancelLabel="Cancel"
        destructive
        busy={clearChatForEveryone.isPending}
        onCancel={() => setConfirmClearForEveryone(false)}
        onConfirm={() =>
          clearChatForEveryone.mutate(undefined, {
            onSettled: () => setConfirmClearForEveryone(false),
          })
        }
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete messages?"
        message="Selected messages will be removed from your chat only."
        confirmLabel="Delete for me"
        cancelLabel="Cancel"
        destructive
        busy={deleteMessages.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={deleteSelected}
      />

      <ForwardMessageDialog
        open={selection.forwardOpen}
        messageIds={selection.forwardIds}
        busy={forwardMessages.isPending}
        onClose={() => {
          selection.closeForward();
          selection.exitSelection();
        }}
        onForward={(target) =>
          forwardMessages.mutate(
            { messageIds: selection.forwardIds, ...target },
            {
              onSuccess: () => {
                selection.closeForward();
                selection.exitSelection();
              },
            },
          )
        }
      />

      <div className="chat-thread-wrap min-h-0 flex-1">
        <div className="chat-thread h-full">
          <div className="chat-thread-inner mt-auto w-full min-w-0">
          <ChatMessageList
          messages={items}
          isLoading={messages.isLoading}
          currentUserId={me?.id}
          showSenderName
          selectionMode={selection.selectionMode}
          selectedIds={selection.selectedIds}
          onToggleSelect={selection.toggleSelect}
          onEnterSelection={selection.enterSelection}
          onReact={(id, emoji) => toggleReaction.mutate({ id, emoji })}
          onReply={handleReply}
          onForward={(id) => selection.openForward([id])}
          onDeleteForMe={(id) => deleteMessageForMe.mutate(id)}
          onDeleteForEveryone={(id) => deleteMessageForEveryone.mutate(id)}
          bottomRef={bottomRef}
          tickMode="group"
          participantCount={groupData?.participants.length}
        />
          </div>
        </div>
      </div>

      <MessageComposer
        value={draft}
        onChange={setDraft}
        onSend={onSend}
        disabled={sendMessage.isPending}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        placeholder={t("typePlaceholder")}
      />
      </div>

      <GroupInfoPanel
        group={groupData}
        open={sidePanel === "info"}
        onClose={() => setSidePanel("none")}
        onOpenMedia={() => setSidePanel("media")}
      />
      <MediaFilesPanel
        open={sidePanel === "media"}
        messages={items}
        onClose={() => setSidePanel("none")}
      />
    </div>
  );
}
