"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  useArchiveDmChat,
  useClearConversation,
  useClearConversationForEveryone,
  useConversation,
  useDeleteMessageForEveryone,
  useDeleteMessageForMe,
  useDeleteMessages,
  useDmChats,
  useForwardMessages,
  useMarkConversationRead,
  useSendMessage,
  useToggleMessageReaction,
  useUnarchiveDmChat,
  useUser,
  useUserPresence,
  type Message,
  type ReplyTarget,
  type SendMessageDto,
} from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useTypingEmitter } from "@/lib/use-typing-emitter";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import { Archive, ArchiveRestore, ArrowLeft, Forward, MoreVertical, Trash2, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { ChatMessageList } from "./ChatMessageList";
import { ContactInfoPanel } from "./ContactInfoPanel";
import { ForwardMessageDialog } from "./ForwardMessageDialog";
import { MediaFilesPanel } from "./MediaFilesPanel";
import { MessageComposer, type ComposerSendPayload } from "./MessageComposer";
import { buildMessagesFromComposerPayload } from "./composer-send.utils";
import { presenceSubtitle } from "./presence.utils";
import { useMessageSelection } from "./useMessageSelection";

export function Conversation({ otherUserId }: { otherUserId: string }) {
  const t = useTranslations("Chat");
  const router = useRouter();
  const me = useAuthUser();
  const otherUser = useUser(otherUserId);
  const peerPresence = useUserPresence(otherUserId);
  const conversation = useConversation(otherUserId);
  const archivedChats = useDmChats(true);
  const archiveChat = useArchiveDmChat();
  const unarchiveChat = useUnarchiveDmChat();
  const sendMessage = useSendMessage();
  const markRead = useMarkConversationRead();
  const clearChat = useClearConversation();
  const clearChatForEveryone = useClearConversationForEveryone();
  const toggleReaction = useToggleMessageReaction();
  const deleteMessages = useDeleteMessages();
  const deleteMessageForMe = useDeleteMessageForMe();
  const deleteMessageForEveryone = useDeleteMessageForEveryone();
  const forwardMessages = useForwardMessages();
  const selection = useMessageSelection();

  const [draft, setDraft] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidePanel, setSidePanel] = useState<"none" | "contact" | "media">(
    "none",
  );
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmClearForEveryone, setConfirmClearForEveryone] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { emitTyping, stopTyping } = useTypingEmitter(otherUserId);

  const messages = conversation.data ?? [];
  const presenceLabel = presenceSubtitle(peerPresence.data, {
    typing: peerTyping,
  });
  const isArchived = (archivedChats.data ?? []).some(
    (chat) => chat.peerUserId === otherUserId,
  );

  useEffect(() => {
    if (otherUserId) markRead.mutate(otherUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId, messages.length]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !me?.id) return;
    for (const msg of messages) {
      if (
        msg.senderId === otherUserId &&
        msg.recipientId === me.id &&
        !msg.delivered
      ) {
        socket.emit("dm.delivered", { messageId: msg.id });
      }
    }
  }, [messages, otherUserId, me?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, peerTyping, selection.selectionMode]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onStart = (payload: { senderId?: string }) => {
      if (payload?.senderId === otherUserId) setPeerTyping(true);
    };
    const onStop = (payload: { senderId?: string }) => {
      if (payload?.senderId === otherUserId) setPeerTyping(false);
    };
    socket.on("typing.start", onStart);
    socket.on("typing.stop", onStop);
    return () => {
      socket.off("typing.start", onStart);
      socket.off("typing.stop", onStop);
    };
  }, [otherUserId]);

  const onSend = (payload: ComposerSendPayload) => {
    if (payload.messageType === "text" && !payload.content && !payload.attachments?.length) {
      return;
    }
    stopTyping();
    const outbound = buildMessagesFromComposerPayload<SendMessageDto>(
      payload,
      { recipientId: otherUserId },
      replyTo?.id,
    ).filter(
      (message) => message.messageType !== "text" || Boolean(message.content),
    );
    if (outbound.length === 0) return;

    sendMessage.mutate(outbound.length === 1 ? outbound[0] : outbound);
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
          : (otherUser.data?.displayName ?? "User"),
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

  return (
    <div className="flex h-full min-h-0 min-w-0 overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <header className="chat-mobile-header flex items-center gap-3 border-b border-border px-4 py-3">
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
                aria-label="Forward selected"
              >
                <Forward className="size-5" />
              </button>
              <button
                type="button"
                disabled={selection.selectedIds.size === 0}
                onClick={() => setConfirmDelete(true)}
                className="grid size-9 place-items-center rounded-full text-destructive hover:bg-accent disabled:opacity-40"
                aria-label="Delete selected"
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
                setSidePanel((panel) =>
                  panel === "contact" ? "none" : "contact",
                )
              }
              className="flex select-none items-center gap-3 border-none bg-transparent p-0 text-left outline-none focus:outline-none"
            >
              <UserAvatar
                name={otherUser.data?.displayName}
                photoURL={otherUser.data?.photoURL}
                className="size-9"
                showOnline={peerPresence.data?.online}
              />
              <span>
                <span className="block text-sm font-semibold">
                  {otherUser.data?.displayName ?? "…"}
                </span>
                {presenceLabel ? (
                  <span
                    className={cn(
                      "block text-xs",
                      peerTyping || peerPresence.data?.online
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  >
                    {presenceLabel}
                  </span>
                ) : otherUser.data?.branch ? (
                  <span className="block text-xs text-muted-foreground">
                    {otherUser.data.branch}
                  </span>
                ) : null}
              </span>
            </button>

            <div className="relative ml-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((o) => !o);
                }}
                aria-label="Conversation options"
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
                        setSidePanel("contact");
                      }}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      <User className="size-4" />
                      Contact info
                    </button>
                    <Link
                      href={`/profile/${otherUserId}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-accent"
                    >
                      <User className="size-4" />
                      View profile
                    </Link>
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
                          unarchiveChat.mutate(otherUserId);
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
                          archiveChat.mutate(otherUserId, {
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
                  </div>
                </>
              ) : null}
            </div>
          </>
        )}
      </header>

      <ConfirmDialog
        open={confirmClear}
        title="Clear chat?"
        message="Messages will be removed from this chat on your device only. The other person will still see them."
        confirmLabel="Clear for me"
        cancelLabel="Cancel"
        destructive
        busy={clearChat.isPending}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() =>
          clearChat.mutate(otherUserId, {
            onSettled: () => setConfirmClear(false),
          })
        }
      />

      <ConfirmDialog
        open={confirmClearForEveryone}
        title="Delete chat for everyone?"
        message="This permanently deletes all messages in this conversation for both of you."
        confirmLabel="Delete for everyone"
        cancelLabel="Cancel"
        destructive
        busy={clearChatForEveryone.isPending}
        onCancel={() => setConfirmClearForEveryone(false)}
        onConfirm={() =>
          clearChatForEveryone.mutate(otherUserId, {
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
          messages={messages}
          isLoading={conversation.isLoading}
          currentUserId={me?.id}
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
          tickMode="dm"
        />
          </div>
        </div>
      </div>

      <MessageComposer
        value={draft}
        onChange={setDraft}
        onSend={onSend}
        onTyping={emitTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        placeholder={t("typePlaceholder")}
      />
      </div>

      <ContactInfoPanel
        open={sidePanel === "contact"}
        userId={otherUserId}
        onClose={() => setSidePanel("none")}
        onOpenMedia={() => setSidePanel("media")}
      />
      <MediaFilesPanel
        open={sidePanel === "media"}
        messages={messages}
        onClose={() => setSidePanel("none")}
      />
    </div>
  );
}
