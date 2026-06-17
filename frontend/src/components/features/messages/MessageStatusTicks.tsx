"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/lib/api";
import { Check, CheckCheck } from "lucide-react";

export function MessageStatusTicks({
  message,
  mine,
  mode = "dm",
  participantCount,
  onMediaOverlay = false,
}: {
  message: Message;
  mine: boolean;
  mode?: "dm" | "group" | "none";
  participantCount?: number;
  onMediaOverlay?: boolean;
}) {
  if (!mine || message.messageType === "system" || mode === "none") {
    return null;
  }

  let delivered = Boolean(message.delivered);
  let read = Boolean(message.read);

  if (mode === "group" && participantCount && participantCount > 1) {
    const others = participantCount - 1;
    const readByOthers = (message.readBy ?? []).filter(
      (id) => id !== message.senderId,
    ).length;
    delivered = true;
    read = readByOthers >= others;
  } else if (mode === "dm") {
    read = Boolean(message.read);
    delivered = Boolean(message.delivered) || read;
  }

  const tickClass = cn(
    "size-[15px] shrink-0",
    onMediaOverlay
      ? read
        ? "text-sky-300"
        : "text-white/90"
      : read
        ? "text-[#53bdeb]"
        : mine
          ? "text-current opacity-80"
          : "text-muted-foreground",
  );

  if (!delivered) {
    return <Check className={tickClass} aria-label="Sent" />;
  }

  return (
    <CheckCheck
      className={tickClass}
      aria-label={read ? "Read" : "Delivered"}
    />
  );
}
