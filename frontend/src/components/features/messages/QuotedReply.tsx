"use client";

import { isTextArt } from "./message-content.utils";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function QuotedReply({
  senderName,
  content,
  mine,
  onClick,
}: {
  senderName?: string;
  content?: string;
  mine: boolean;
  onClick?: () => void;
}) {
  const t = useTranslations("Chat");
  if (!content) return null;

  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={
        onClick
          ? (e: React.MouseEvent) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
      className={cn(
        "chat-message-quote mb-1 w-full max-w-full",
        mine ? "chat-message-quote--out" : "chat-message-quote--in",
        onClick && "chat-message-quote--clickable",
      )}
    >
      <p className="chat-message-quote-author">{senderName || "User"}</p>
      <p className="chat-message-quote-text">
        {isTextArt(content) ? t("textArt") : content}
      </p>
    </Comp>
  );
}

export function quotedReplyLabel(
  replyToSenderId: string | undefined,
  replyToSenderName: string | undefined,
  currentUserId?: string,
) {
  if (!replyToSenderId) return replyToSenderName || "User";
  if (replyToSenderId === currentUserId) return "You";
  return replyToSenderName || "User";
}
