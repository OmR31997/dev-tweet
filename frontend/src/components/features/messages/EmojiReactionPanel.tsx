"use client";

import { useOverlayDismiss } from "@/lib/use-overlay-dismiss";
import { usePointerTap } from "@/lib/use-pointer-tap";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { EmojiClickData } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

function QuickReactionButton({
  emoji,
  onPick,
}: {
  emoji: string;
  onPick: (emoji: string) => void;
}) {
  const tap = usePointerTap(() => onPick(emoji));

  return (
    <button
      type="button"
      {...tap}
      className="rounded-md px-2 py-1.5 text-xl transition-colors hover:bg-accent active:bg-accent touch-manipulation"
      aria-label={`React with ${emoji}`}
    >
      {emoji}
    </button>
  );
}

export function EmojiReactionPanel({
  open,
  onClose,
  onPick,
  className,
  style,
  growUpward,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
  className?: string;
  style?: React.CSSProperties;
  growUpward?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { onBackdropPointerDown } = useOverlayDismiss(open, onClose);
  const expandTap = usePointerTap(() => setExpanded((value) => !value));

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const handlePick = (emoji: string) => {
    onPick(emoji);
    setExpanded(false);
    onClose();
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[80] touch-none bg-transparent"
        onPointerDown={onBackdropPointerDown}
        aria-hidden
      />
      <div
        className={cn(
          "fixed z-[81] overflow-hidden rounded-xl border border-border bg-card shadow-2xl touch-manipulation",
          expanded ? "w-[min(320px,calc(100vw-1rem))]" : "w-fit max-w-[calc(100vw-1rem)]",
          growUpward && "flex flex-col-reverse",
          className,
        )}
        style={style}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-0.5 bg-card py-1.5 pl-1.5 pr-1">
          {QUICK_REACTIONS.map((emoji) => (
            <QuickReactionButton
              key={emoji}
              emoji={emoji}
              onPick={handlePick}
            />
          ))}
          <button
            type="button"
            {...expandTap}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:bg-accent touch-manipulation"
            aria-label={expanded ? "Hide emoji list" : "Show all emojis"}
          >
            <Plus
              className={cn("size-4 transition-transform", expanded && "rotate-45")}
            />
          </button>
        </div>

        {expanded ? (
          <EmojiPicker
            onEmojiClick={(data: EmojiClickData) => handlePick(data.emoji)}
            theme={Theme.AUTO}
            width={320}
            height={360}
            searchPlaceHolder="Search emoji"
            previewConfig={{ showPreview: false }}
            lazyLoadEmojis
          />
        ) : null}
      </div>
    </>,
    document.body,
  );
}
