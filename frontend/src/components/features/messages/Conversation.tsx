"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useClearConversation,
  useConversation,
  useMarkConversationRead,
  useSendMessage,
  useUser,
} from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import { ArrowLeft, MoreVertical, Send, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function Conversation({ otherUserId }: { otherUserId: string }) {
  const me = useAuthUser();
  const otherUser = useUser(otherUserId);
  const conversation = useConversation(otherUserId);
  const sendMessage = useSendMessage();
  const markRead = useMarkConversationRead();
  const clearChat = useClearConversation();

  const [draft, setDraft] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messages = conversation.data ?? [];

  // Mark read whenever the conversation loads / changes.
  useEffect(() => {
    if (otherUserId) markRead.mutate(otherUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId, messages.length]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, peerTyping]);

  // Peer typing indicator.
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

  const emitTyping = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("typing.start", { recipientId: otherUserId });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing.stop", { recipientId: otherUserId });
    }, 1500);
  };

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    getSocket()?.emit("typing.stop", { recipientId: otherUserId });
    sendMessage.mutate({ recipientId: otherUserId, content });
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <Link href="/messages" className="md:hidden">
          <ArrowLeft className="size-5" />
        </Link>
        <Link
          href={`/profile/${otherUserId}`}
          className="flex items-center gap-3"
        >
          <UserAvatar
            name={otherUser.data?.displayName}
            photoURL={otherUser.data?.photoURL}
            className="size-9"
          />
          <span>
            <span className="block text-sm font-semibold">
              {otherUser.data?.displayName ?? "…"}
            </span>
            {peerTyping ? (
              <span className="block text-xs text-primary">typing…</span>
            ) : otherUser.data?.branch ? (
              <span className="block text-xs text-muted-foreground">
                {otherUser.data.branch}
              </span>
            ) : null}
          </span>
        </Link>

        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Conversation options"
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <MoreVertical className="size-5" />
          </button>

          {menuOpen ? (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
                <Link
                  href={`/profile/${otherUserId}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <User className="size-4" />
                  View profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setConfirmClear(true);
                  }}
                  className="flex w-full items-center gap-3 border-t border-border px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-accent"
                >
                  <Trash2 className="size-4" />
                  Clear chat
                </button>
              </div>
            </>
          ) : null}
        </div>
      </header>

      <ConfirmDialog
        open={confirmClear}
        title="Clear chat?"
        message="This deletes all messages in this conversation for both of you. This can't be undone."
        confirmLabel="Clear chat"
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

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {conversation.isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No messages yet. Say hello 👋
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === me?.id;
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
                    mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted text-foreground"
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      mine
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {timeAgo(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={onSend}
        className="flex items-center gap-2 border-t border-border bg-card px-4 py-3"
      >
        <Input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            emitTyping();
          }}
          placeholder="Type a message…"
          className="h-10"
        />
        <Button
          type="submit"
          size="icon"
          className="size-10 shrink-0"
          disabled={!draft.trim() || sendMessage.isPending}
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
