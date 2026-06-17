"use client";

import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { EmojiClickData } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import { cn } from "@/lib/utils";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

const QUICK_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

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

  if (!open) return null;

  const handlePick = (emoji: string) => {
    onPick(emoji);
    setExpanded(false);
    onClose();
  };

  const handleClose = () => {
    setExpanded(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={handleClose} />
      <div
        className={cn(
          "fixed z-50 overflow-hidden rounded-xl border border-border bg-card shadow-2xl",
          expanded ? "w-[min(320px,calc(100vw-1rem))]" : "w-fit",
          growUpward && "flex flex-col-reverse",
          className,
        )}
        style={style}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-0.5 bg-card py-1.5 pl-1.5 pr-1">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handlePick(emoji)}
              className="rounded-md px-1.5 py-1 text-xl transition-colors hover:bg-accent"
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
          />
        ) : null}
      </div>
    </>
  );
}
