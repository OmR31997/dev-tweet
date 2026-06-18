"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { useUser, type Message } from "@/lib/api";
import { isOptimisticId } from "@/lib/api/optimistic";
import { formatMessageTime } from "@/lib/format";
import { useOverlayDismiss } from "@/lib/use-overlay-dismiss";
import { usePointerTap } from "@/lib/use-pointer-tap";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import { QuotedReply, quotedReplyLabel } from "./QuotedReply";
import {
  Check,
  Copy,
  Forward,
  Heart,
  Reply,
  Smile,
  Trash2,
} from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { EmojiReactionPanel } from "./EmojiReactionPanel";
import { ForwardedLabel } from "./ForwardedLabel";
import { MessageContent, messageBubbleMaxWidth, messageBubbleMinWidth } from "./MessageContent";
import { BubbleTextWithMeta } from "./BubbleTextWithMeta";
import { MessageMedia } from "./MessageMedia";
import { MessageStatusTicks } from "./MessageStatusTicks";
import { MessageSwipeToReply } from "./MessageSwipeToReply";
import { ChatMessageText } from "./ChatMessageText";
import { extractPrimaryLink, isLinkOnlyMessage } from "./chat-message-text.utils";
import { isTextArt, normalizeMessageContent } from "./message-content.utils";
import { LinkPreviewCard } from "./LinkPreviewCard";

const MENU_WIDTH = 208;
const MENU_GAP = 8;
const VIEWPORT_PAD = 8;

const menuItemClass =
  "flex w-full items-center gap-3 whitespace-nowrap px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent active:bg-accent touch-manipulation";

function ReactionPill({
  emoji,
  count,
  active,
  onReact,
}: {
  emoji: string;
  count: number;
  active: boolean;
  onReact: (emoji: string) => void;
}) {
  const tap = usePointerTap(() => onReact(emoji));

  return (
    <button
      type="button"
      {...tap}
      className={cn(
        "chat-message-reaction-pill touch-manipulation",
        active && "chat-message-reaction-pill--active",
      )}
    >
      <span className="chat-message-reaction-emoji">{emoji}</span>
      <span>{count}</span>
    </button>
  );
}

function MenuAction({
  onAction,
  className,
  children,
}: {
  onAction: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const tap = usePointerTap(onAction);

  return (
    <button type="button" {...tap} className={className}>
      {children}
    </button>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function menuPosition(
  rect: DOMRect,
  mine: boolean,
  menuHeight: number,
  menuWidth: number,
) {
  const fitsBelow =
    rect.bottom + MENU_GAP + menuHeight <= window.innerHeight - VIEWPORT_PAD;
  const fitsAbove = rect.top - MENU_GAP - menuHeight >= VIEWPORT_PAD;
  const fitsLeft = rect.left - MENU_GAP - menuWidth >= VIEWPORT_PAD;
  const fitsRight =
    rect.right + MENU_GAP + menuWidth <= window.innerWidth - VIEWPORT_PAD;

  let top: number;
  let left: number;

  if (mine) {
    if (fitsLeft) {
      top = rect.top;
      left = rect.left - menuWidth - MENU_GAP;
    } else if (fitsBelow) {
      top = rect.bottom + MENU_GAP;
      left = clamp(
        rect.right - menuWidth,
        VIEWPORT_PAD,
        window.innerWidth - menuWidth - VIEWPORT_PAD,
      );
    } else if (fitsAbove) {
      top = rect.top - menuHeight - MENU_GAP;
      left = clamp(
        rect.right - menuWidth,
        VIEWPORT_PAD,
        window.innerWidth - menuWidth - VIEWPORT_PAD,
      );
    } else {
      top = clamp(
        rect.top - menuHeight - MENU_GAP,
        VIEWPORT_PAD,
        window.innerHeight - menuHeight - VIEWPORT_PAD,
      );
      left = clamp(
        rect.right - menuWidth,
        VIEWPORT_PAD,
        window.innerWidth - menuWidth - VIEWPORT_PAD,
      );
    }
  } else if (fitsRight) {
    top = rect.top;
    left = rect.right + MENU_GAP;
  } else if (fitsBelow) {
    top = rect.bottom + MENU_GAP;
    left = clamp(
      rect.left,
      VIEWPORT_PAD,
      window.innerWidth - menuWidth - VIEWPORT_PAD,
    );
  } else if (fitsAbove) {
    top = rect.top - menuHeight - MENU_GAP;
    left = clamp(
      rect.left,
      VIEWPORT_PAD,
      window.innerWidth - menuWidth - VIEWPORT_PAD,
    );
  } else {
    top = clamp(
      rect.top - menuHeight - MENU_GAP,
      VIEWPORT_PAD,
      window.innerHeight - menuHeight - VIEWPORT_PAD,
    );
    left = clamp(
      rect.left,
      VIEWPORT_PAD,
      window.innerWidth - menuWidth - VIEWPORT_PAD,
    );
  }

  return {
    top: clamp(
      top,
      VIEWPORT_PAD,
      window.innerHeight - menuHeight - VIEWPORT_PAD,
    ),
    left: clamp(
      left,
      VIEWPORT_PAD,
      window.innerWidth - menuWidth - VIEWPORT_PAD,
    ),
  };
}

export function MessageBubble({
  message,
  mine,
  showSenderName,
  selectionMode,
  selected,
  highlighted,
  onToggleSelect,
  onEnterSelection,
  onReact,
  onReply,
  onJumpToReply,
  onForward,
  onDeleteForMe,
  onDeleteForEveryone,
  mediaGallery,
  tickMode = "dm",
  participantCount,
  focused,
  onMessageFocus,
}: {
  message: Message;
  mine: boolean;
  showSenderName?: boolean;
  selectionMode: boolean;
  selected: boolean;
  highlighted?: boolean;
  onToggleSelect: () => void;
  onEnterSelection: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onJumpToReply?: () => void;
  onForward: () => void;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  mediaGallery?: Message[];
  tickMode?: "dm" | "group" | "none";
  participantCount?: number;
  focused?: boolean;
  onMessageFocus?: () => void;
}) {
  const t = useTranslations("Chat");
  const me = useAuthUser();
  const sender = useUser(showSenderName ? message.senderId : undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [emojiPos, setEmojiPos] = useState<React.CSSProperties>({});
  const bubbleRef = useRef<HTMLDivElement>(null);
  const bubbleWrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);

  const reactionSummary = useMemo(() => {
    const map = new Map<string, number>();
    for (const reaction of message.reactions ?? []) {
      if (!reaction.emoji) continue;
      map.set(reaction.emoji, (map.get(reaction.emoji) ?? 0) + 1);
    }
    return Array.from(map.entries());
  }, [message.reactions]);

  const myReaction = message.reactions?.find((r) => r.userId === me?.id)?.emoji;

  const isTextMessage = message.messageType === "text";
  const isImageMessage = message.messageType === "image";
  const hasMediaCaption = Boolean(message.content?.trim());
  const isImageOnly = isImageMessage && !hasMediaCaption;
  const isArtMessage = isTextArt(normalizeMessageContent(message.content));
  const showTextWithInlineMeta =
    isTextMessage && !isArtMessage && Boolean(message.content.trim());
  const primaryLink = showTextWithInlineMeta
    ? extractPrimaryLink(message.content)
    : null;
  const linkOnly =
    Boolean(primaryLink) && isLinkOnlyMessage(message.content, primaryLink!);

  const metaClass = cn(
    "inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap",
  );

  const messageMeta = (
    <>
      <span>{formatMessageTime(message.createdAt)}</span>
      <MessageStatusTicks
        message={message}
        mine={mine}
        mode={tickMode}
        participantCount={participantCount}
      />
    </>
  );

  const messageMetaOverlay = (
    <>
      <span>{formatMessageTime(message.createdAt)}</span>
      <MessageStatusTicks
        message={message}
        mine={mine}
        mode={tickMode}
        participantCount={participantCount}
        onMediaOverlay
      />
    </>
  );

  const closeMenus = useCallback(() => {
    setMenuOpen(false);
    setEmojiOpen(false);
  }, []);

  const { onBackdropPointerDown: onMenuBackdropPointerDown } = useOverlayDismiss(
    menuOpen,
    closeMenus,
  );

  const openMenuAtBubble = () => {
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos(menuPosition(rect, mine, 280, MENU_WIDTH));
    }
    setMenuOpen(true);
    setEmojiOpen(false);
  };

  useLayoutEffect(() => {
    if (!menuOpen || !bubbleRef.current || !menuRef.current) return;
    const rect = bubbleRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight;
    const menuWidth = menuRef.current.offsetWidth;
    setMenuPos(menuPosition(rect, mine, menuHeight, menuWidth));
  }, [menuOpen, mine]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (selectionMode) return;
    e.preventDefault();
    e.stopPropagation();
    bubbleWrapRef.current?.blur();
    openMenuAtBubble();
  };

  const handleDoubleTap = () => {
    if (selectionMode) return;
    suppressClickRef.current = true;
    bubbleWrapRef.current?.blur();
    openMenuAtBubble();
  };

  const handleLongPress = () => {
    if (selectionMode) return;
    suppressClickRef.current = true;
    bubbleWrapRef.current?.blur();
    openMenuAtBubble();
  };

  const openReactionPicker = () => {
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (rect) {
      const panelWidth = 320;
      const quickHeight = 48;
      const fullHeight = 420;
      const mobileComposerReserve = window.innerWidth < 768 ? 96 : 0;
      const usableHeight = window.innerHeight - mobileComposerReserve;
      const spaceBelow = usableHeight - rect.bottom;
      const left = mine
        ? Math.max(8, rect.right - panelWidth)
        : Math.min(rect.left, window.innerWidth - panelWidth - 8);
      if (spaceBelow > fullHeight) {
        setEmojiPos({ top: rect.bottom + MENU_GAP, left });
      } else if (rect.top > fullHeight) {
        setEmojiPos({
          bottom: window.innerHeight - rect.top + MENU_GAP,
          left,
        });
      } else {
        setEmojiPos({
          top: spaceBelow > quickHeight + 8 ? rect.bottom + MENU_GAP : 8,
          left: Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8)),
        });
      }
    }
    setMenuOpen(false);
    window.setTimeout(() => setEmojiOpen(true), 0);
  };

  const handleClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (selectionMode) {
      onToggleSelect();
      return;
    }
    onMessageFocus?.();
    bubbleWrapRef.current?.focus();
  };

  const copyMessage = async () => {
    closeMenus();
    const text = message.content?.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard may be unavailable outside a secure context.
    }
  };

  const swipeDisabled = selectionMode || menuOpen || emojiOpen;

  return (
    <>
      <div
        id={`chat-message-${message.id}`}
        className={cn(
          "chat-message-row scroll-mt-4",
          mine ? "chat-message-row--out" : "chat-message-row--in",
          isOptimisticId(message.id) && "chat-message-row--pending",
          selectionMode && "cursor-pointer",
        )}
        onClick={handleClick}
      >
        {selectionMode ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className={cn(
              "mt-2 grid size-5 shrink-0 place-items-center rounded-full border",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground/40",
            )}
            aria-label={selected ? "Deselect message" : "Select message"}
          >
            {selected ? <Check className="size-3" /> : null}
          </button>
        ) : null}

        {!mine && showSenderName ? (
          <UserAvatar
            name={sender.data?.displayName}
            photoURL={sender.data?.photoURL}
            className="size-7 shrink-0 self-end"
          />
        ) : null}

        <MessageSwipeToReply
          mine={mine}
          disabled={swipeDisabled}
          onReply={onReply}
          onLongPress={handleLongPress}
          onDoubleTap={handleDoubleTap}
          onDoubleClick={handleDoubleClick}
        >
          <div
            ref={bubbleWrapRef}
            tabIndex={selectionMode ? -1 : 0}
            role="article"
            aria-label="Chat message"
            title={focused && !selectionMode ? "Press R to reply" : undefined}
            onFocus={onMessageFocus}
            onDoubleClick={handleDoubleClick}
            className={cn(
              "chat-bubble-wrap outline-none focus:outline-none",
              isImageMessage && "chat-bubble-wrap--media",
              primaryLink && "chat-bubble-wrap--link",
              messageBubbleMaxWidth(message.content),
              primaryLink
                ? ""
                : messageBubbleMinWidth(message.content, {
                    hasReply: Boolean(message.replyToContent),
                    isForwarded: Boolean(message.isForwarded),
                  }),
              highlighted &&
                "rounded-2xl ring-2 ring-primary/70 ring-offset-1 ring-offset-background transition-shadow duration-300",
            )}
          >
            <div
              ref={bubbleRef}
              className={cn(
                "chat-bubble",
                mine ? "chat-bubble--out" : "chat-bubble--in",
                primaryLink && "chat-bubble--link",
                isImageMessage && "chat-bubble--media",
                selected && "ring-2 ring-primary/60",
                !selectionMode && "cursor-default select-none",
                isArtMessage && "chat-bubble--text-art",
              )}
            >
            {message.isForwarded ? (
              <ForwardedLabel mine={mine} />
            ) : null}

            {showSenderName && !mine ? (
              <p className="mb-0.5 text-xs font-semibold text-primary">
                {sender.data?.displayName ?? "…"}
              </p>
            ) : null}

            {message.replyToContent ? (
              <QuotedReply
                senderName={quotedReplyLabel(
                  message.replyToSenderId,
                  message.replyToSenderName,
                  me?.id,
                )}
                content={message.replyToContent}
                mine={mine}
                onClick={
                  message.replyToId && onJumpToReply ? onJumpToReply : undefined
                }
              />
            ) : null}

            {message.messageType === "image" ||
            message.messageType === "document" ? (
              <MessageMedia
                message={message}
                mine={mine}
                gallery={mediaGallery}
                metaOverlay={isImageOnly ? messageMetaOverlay : undefined}
                captionMeta={
                  hasMediaCaption && !isImageOnly ? messageMeta : undefined
                }
                footerMeta={
                  message.messageType === "document" && !hasMediaCaption
                    ? messageMeta
                    : undefined
                }
                metaClass={
                  isImageOnly
                    ? "inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[11px] text-white/95"
                    : metaClass
                }
              />
            ) : showTextWithInlineMeta ? (
              <>
                {primaryLink ? (
                  <LinkPreviewCard url={primaryLink} mine={mine} />
                ) : null}
                {linkOnly && primaryLink ? (
                  <BubbleTextWithMeta meta={messageMeta}>
                    <ChatMessageText content={primaryLink} mine={mine} />
                  </BubbleTextWithMeta>
                ) : (
                  <BubbleTextWithMeta meta={messageMeta}>
                    {message.content.length > 320 ||
                    message.content.split("\n").length > 6 ? (
                      <MessageContent
                        content={message.content}
                        mine={mine}
                        inline
                      />
                    ) : (
                      <ChatMessageText content={message.content} mine={mine} />
                    )}
                  </BubbleTextWithMeta>
                )}
              </>
            ) : (
              <MessageContent
                content={message.content}
                mine={mine}
                footerMeta={isArtMessage ? messageMeta : undefined}
              />
            )}
          </div>

          {reactionSummary.length > 0 ? (
            <div className="chat-message-reactions">
              {reactionSummary.map(([emoji, count]) => (
                <ReactionPill
                  key={emoji}
                  emoji={emoji}
                  count={count}
                  active={myReaction === emoji}
                  onReact={onReact}
                />
              ))}
            </div>
          ) : null}
          </div>
        </MessageSwipeToReply>
      </div>

      {menuOpen && typeof document !== "undefined"
        ? createPortal(
            <>
              <div
                className="fixed inset-0 z-[80] touch-none bg-transparent"
                onPointerDown={onMenuBackdropPointerDown}
                aria-hidden
              />
              <div
                ref={menuRef}
                className="fixed z-[81] w-52 overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-xl touch-manipulation"
                style={{ top: menuPos.top, left: menuPos.left }}
                onPointerDown={(e) => e.stopPropagation()}
              >
            <MenuAction
              onAction={() => {
                closeMenus();
                onReact("❤️");
              }}
              className={menuItemClass}
            >
              <Heart className="size-4" />
              {t("like")}
            </MenuAction>
            <MenuAction
              onAction={openReactionPicker}
              className={cn(menuItemClass, "border-t border-border")}
            >
              <Smile className="size-4" />
              {t("react")}
            </MenuAction>
            <MenuAction
              onAction={() => {
                closeMenus();
                onReply();
              }}
              className={cn(menuItemClass, "border-t border-border")}
            >
              <Reply className="size-4" />
              {t("reply")}
              <span className="ml-auto text-xs text-muted-foreground">R</span>
            </MenuAction>
            <MenuAction
              onAction={() => {
                closeMenus();
                onForward();
              }}
              className={cn(menuItemClass, "border-t border-border")}
            >
              <Forward className="size-4" />
              {t("forward")}
            </MenuAction>
            <MenuAction
              onAction={() => {
                closeMenus();
                onEnterSelection();
              }}
              className={cn(menuItemClass, "border-t border-border")}
            >
              <Check className="size-4 shrink-0" />
              {t("select")}
            </MenuAction>
            {message.content?.trim() ? (
              <MenuAction
                onAction={() => void copyMessage()}
                className={cn(menuItemClass, "border-t border-border")}
              >
                <Copy className="size-4 shrink-0" />
                {t("copy")}
              </MenuAction>
            ) : null}
            <MenuAction
              onAction={() => {
                closeMenus();
                onDeleteForMe();
              }}
              className={cn(menuItemClass, "border-t border-border")}
            >
              <Trash2 className="size-4 shrink-0" />
              {t("deleteForMe")}
            </MenuAction>
            {mine ? (
              <MenuAction
                onAction={() => {
                  closeMenus();
                  onDeleteForEveryone();
                }}
                className={cn(
                  menuItemClass,
                  "border-t border-border text-destructive hover:text-destructive",
                )}
              >
                <Trash2 className="size-4 shrink-0" />
                {t("deleteForEveryone")}
              </MenuAction>
            ) : null}
              </div>
            </>,
            document.body,
          )
        : null}

      <EmojiReactionPanel
        open={emojiOpen}
        onClose={closeMenus}
        onPick={onReact}
        style={emojiPos}
        growUpward={"bottom" in emojiPos}
      />
    </>
  );
}
