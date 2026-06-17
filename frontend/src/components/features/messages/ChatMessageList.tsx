"use client";

import type { Message } from "@/lib/api";
import { chatDateLabel, chatDayKey } from "@/lib/format";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatDateDivider } from "./ChatDateDivider";
import { MessageBubble } from "./MessageBubble";
import { SystemMessageBubble } from "./SystemMessageBubble";

type ChatItem =
  | { kind: "date"; key: string; label: string }
  | { kind: "message"; key: string; message: Message };

function buildChatItems(messages: Message[]): ChatItem[] {
  const items: ChatItem[] = [];
  let lastDay = "";

  for (const message of messages) {
    const day = chatDayKey(message.createdAt);
    if (day && day !== lastDay) {
      items.push({
        kind: "date",
        key: `date-${day}`,
        label: chatDateLabel(message.createdAt),
      });
      lastDay = day;
    }
    items.push({ kind: "message", key: message.id, message });
  }

  return items;
}

export function ChatMessageList({
  messages,
  isLoading,
  currentUserId,
  showSenderName,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onEnterSelection,
  onReact,
  onReply,
  onForward,
  onDeleteForMe,
  onDeleteForEveryone,
  bottomRef,
  tickMode = "dm",
  participantCount,
}: {
  messages: Message[];
  isLoading: boolean;
  currentUserId?: string;
  showSenderName?: boolean;
  selectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onEnterSelection: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onReply: (message: Message) => void;
  onForward: (id: string) => void;
  onDeleteForMe: (id: string) => void;
  onDeleteForEveryone: (id: string) => void;
  bottomRef?: React.RefObject<HTMLDivElement | null>;
  tickMode?: "dm" | "group" | "none";
  participantCount?: number;
}) {
  const items = useMemo(() => buildChatItems(messages), [messages]);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [focusedMessageId, setFocusedMessageId] = useState<string | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`chat-message-${messageId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(messageId);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(() => setHighlightedId(null), 1600);
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
    };
  }, []);

  useEffect(() => {
    if (selectionMode) {
      setFocusedMessageId(null);
    }
  }, [selectionMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (selectionMode || !focusedMessageId) return;
      if (event.key !== "r" && event.key !== "R") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;

      const message = messages.find((item) => item.id === focusedMessageId);
      if (!message || message.messageType === "system") return;

      event.preventDefault();
      onReply(message);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusedMessageId, messages, onReply, selectionMode]);

  const messageIds = useMemo(
    () => new Set(messages.map((message) => message.id)),
    [messages],
  );

  const jumpToReply = useCallback(
    (replyToId?: string) => {
      if (!replyToId || !messageIds.has(replyToId)) return;
      scrollToMessage(replyToId);
    },
    [messageIds, scrollToMessage],
  );

  const mediaGallery = useMemo(
    () =>
      messages.filter(
        (message) =>
          message.attachmentId &&
          (message.messageType === "image" ||
            message.messageType === "document"),
      ),
    [messages],
  );

  if (isLoading) {
    return (
      <p className="text-center text-sm text-muted-foreground">Loading…</p>
    );
  }

  if (messages.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No messages yet. Say hello 👋
      </p>
    );
  }

  return (
    <>
      {items.map((item) => {
        if (item.kind === "date") {
          return <ChatDateDivider key={item.key} label={item.label} />;
        }

        const message = item.message;
        if (message.messageType === "system") {
          return (
            <SystemMessageBubble key={item.key} content={message.content} />
          );
        }

        return (
          <MessageBubble
            key={item.key}
            message={message}
            mine={message.senderId === currentUserId}
            showSenderName={showSenderName}
            selectionMode={selectionMode}
            selected={selectedIds.has(message.id)}
            highlighted={highlightedId === message.id}
            onToggleSelect={() => onToggleSelect(message.id)}
            onEnterSelection={() => onEnterSelection(message.id)}
            onReact={(emoji) => onReact(message.id, emoji)}
            onReply={() => onReply(message)}
            onJumpToReply={() => jumpToReply(message.replyToId)}
            onForward={() => onForward(message.id)}
            onDeleteForMe={() => onDeleteForMe(message.id)}
            onDeleteForEveryone={() => onDeleteForEveryone(message.id)}
            mediaGallery={mediaGallery}
            tickMode={tickMode}
            participantCount={participantCount}
            focused={focusedMessageId === message.id}
            onMessageFocus={() => setFocusedMessageId(message.id)}
          />
        );
      })}
      <div ref={bottomRef} />
    </>
  );
}
