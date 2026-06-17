"use client";

import { cn } from "@/lib/utils";
import { Fragment, useMemo } from "react";
import { linkHref, tokenizeMessageText } from "./chat-message-text.utils";

export function ChatMessageText({
  content,
  mine,
  className,
}: {
  content: string;
  mine: boolean;
  className?: string;
}) {
  const tokens = useMemo(() => tokenizeMessageText(content), [content]);

  return (
    <span
      className={cn(
        "chat-bubble-text-inline",
        mine ? "chat-bubble-text-inline--out" : "chat-bubble-text-inline--in",
        className,
      )}
    >
      {tokens.map((token, index) => {
        if (token.type === "link") {
          return (
            <a
              key={`${index}-${token.value}`}
              href={linkHref(token.value)}
              target="_blank"
              rel="noopener noreferrer"
              className="chat-bubble-link"
              onClick={(event) => event.stopPropagation()}
            >
              {token.value}
            </a>
          );
        }

        return <Fragment key={`${index}-text`}>{token.value}</Fragment>;
      })}
    </span>
  );
}
