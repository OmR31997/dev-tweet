"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";
import { ChatMessageText } from "./ChatMessageText";
import {
  collapsedPreview,
  formatTextArtForDisplay,
  isTextArt,
  normalizeMessageContent,
  shouldCollapseMessage,
  shouldCollapseTextArt,
} from "./message-content.utils";

function TextArtBody({
  content,
  collapsed,
  mine,
  showToggle,
  onToggle,
  footerMeta,
  readMoreLabel,
  readLessLabel,
}: {
  content: string;
  collapsed: boolean;
  mine: boolean;
  showToggle: boolean;
  onToggle: () => void;
  footerMeta?: ReactNode;
  readMoreLabel: string;
  readLessLabel: string;
}) {
  const display = formatTextArtForDisplay(content);

  return (
    <div
      className={cn(
        "chat-bubble-text-art-wrap",
        collapsed && showToggle && "chat-bubble-text-art-wrap--collapsed",
      )}
    >
      <div
        className={cn(
          "chat-bubble-text-art-scroll",
          collapsed
            ? "chat-bubble-text-art-scroll--collapsed"
            : "chat-bubble-text-art-scroll--expanded",
        )}
      >
        <pre className="chat-bubble-text-art">{display}</pre>
        {collapsed ? (
          <div
            className={cn(
              "chat-bubble-text-art-fade",
              mine
                ? "chat-bubble-text-art-fade--out"
                : "chat-bubble-text-art-fade--in",
            )}
          />
        ) : null}
      </div>
      {showToggle || footerMeta ? (
        <div
          className={cn(
            "chat-bubble-text-art-footer",
            !showToggle && footerMeta && "chat-bubble-text-art-footer--meta-only",
          )}
        >
          {showToggle ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className={cn(
                "chat-bubble-text-art-toggle",
                mine
                  ? "chat-bubble-text-art-toggle--out"
                  : "chat-bubble-text-art-toggle--in",
              )}
            >
              {collapsed ? readMoreLabel : readLessLabel}
            </button>
          ) : (
            <span aria-hidden className="chat-bubble-text-art-toggle-spacer" />
          )}
          {footerMeta ? (
            <div className="chat-bubble-text-art-meta">{footerMeta}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function MessageContent({
  content,
  mine,
  inline = false,
  footerMeta,
}: {
  content: string;
  mine: boolean;
  /** Renders inside BubbleTextWithMeta (timestamp anchored bottom-right). */
  inline?: boolean;
  /** Timestamp row for text-art bubbles (Read more + time on one line). */
  footerMeta?: ReactNode;
}) {
  const t = useTranslations("Chat");
  const [expanded, setExpanded] = useState(false);
  const normalized = normalizeMessageContent(content);
  const isArt = isTextArt(normalized);
  const collapsible = shouldCollapseMessage(normalized);

  const toggleClass = cn(
    "mt-1 text-xs font-medium",
    mine
      ? "text-primary-foreground/85 hover:text-primary-foreground"
      : "text-primary hover:text-primary/80",
  );

  if (isArt) {
    const artCollapsible = shouldCollapseTextArt(normalized);
    const collapsed = artCollapsible && !expanded;

    const artBody = (
      <TextArtBody
        content={normalized}
        collapsed={collapsed}
        mine={mine}
        showToggle={artCollapsible}
        onToggle={() => setExpanded((value) => !value)}
        footerMeta={footerMeta}
        readMoreLabel={t("readMore")}
        readLessLabel={t("readLess")}
      />
    );

    if (inline) return artBody;

    return <div className="min-w-0">{artBody}</div>;
  }

  if (!collapsible || expanded) {
    if (inline) {
      return (
        <>
          <ChatMessageText content={normalized} mine={mine} />
          {collapsible ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
              }}
              className={cn(toggleClass, "block w-full text-left")}
            >
              {t("readLess")}
            </button>
          ) : null}
        </>
      );
    }

    return (
      <div className="min-w-0">
        <ChatMessageText content={normalized} mine={mine} />
        {collapsible ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(false);
            }}
            className={toggleClass}
          >
            {t("readLess")}
          </button>
        ) : null}
      </div>
    );
  }

  if (inline) {
    return (
      <>
        <ChatMessageText content={collapsedPreview(normalized)} mine={mine} />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
          className={cn(toggleClass, "chat-bubble-read-toggle")}
        >
          {t("readMore")}
        </button>
      </>
    );
  }

  return (
    <div className="min-w-0">
      <ChatMessageText content={collapsedPreview(normalized)} mine={mine} />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(true);
        }}
        className={toggleClass}
      >
        {t("readMore")}
      </button>
    </div>
  );
}

export function messageBubbleMaxWidth(content: string): string {
  if (isTextArt(normalizeMessageContent(content))) {
    return "chat-bubble-wrap--text-art";
  }
  return "";
}

/** Keep reply bubbles wide enough for quote + text row with inline meta. */
export function messageBubbleMinWidth(
  content: string,
  options?: { hasReply?: boolean; isForwarded?: boolean },
): string {
  const { hasReply = false, isForwarded = false } = options ?? {};
  if (isForwarded) return "";

  const trimmed = normalizeMessageContent(content).trim();
  if (hasReply) {
    return trimmed.length <= 48 ? "min-w-[5.5rem]" : "";
  }

  return "";
}
