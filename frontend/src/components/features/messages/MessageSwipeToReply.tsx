"use client";

import { cn } from "@/lib/utils";
import { Reply } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useDoubleTap } from "./use-double-tap";
import { useSwipeToReply } from "./use-swipe-to-reply";

export function MessageSwipeToReply({
  mine,
  disabled,
  onReply,
  onDoubleTap,
  onDoubleClick,
  children,
}: {
  mine: boolean;
  disabled?: boolean;
  onReply: () => void;
  onDoubleTap?: () => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  children: ReactNode;
}) {
  const swipe = useSwipeToReply({ mine, disabled, onReply });
  const { registerPointerUp, reset: resetDoubleTap } = useDoubleTap(() => {
    onDoubleTap?.();
  });
  const {
    reset,
    offset,
    dragging,
    hintVisible,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    didMove,
  } = swipe;

  useEffect(() => {
    if (disabled) {
      reset();
      resetDoubleTap();
    }
  }, [disabled, reset, resetDoubleTap]);

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const moved = didMove();
    onPointerUp(event);
    if (!disabled && onDoubleTap) {
      registerPointerUp(event, moved);
    }
  };

  return (
    <div
      className={cn(
        "chat-message-swipe w-fit max-w-full shrink-0 min-w-min",
        mine ? "chat-message-swipe--out" : "chat-message-swipe--in",
      )}
    >
      <div
        className={cn(
          "chat-message-swipe-hint",
          hintVisible && "chat-message-swipe-hint--visible",
        )}
        aria-hidden
      >
        <Reply className="chat-message-swipe-hint-icon" />
      </div>
      <div
        className={cn(
          "chat-message-swipe-track w-fit max-w-full shrink-0 min-w-min",
          dragging && "chat-message-swipe-track--dragging",
        )}
        style={
          disabled ? undefined : { transform: `translate3d(${offset}px, 0, 0)` }
        }
        onPointerDown={disabled ? undefined : onPointerDown}
        onPointerMove={disabled ? undefined : onPointerMove}
        onPointerUp={disabled ? undefined : handlePointerUp}
        onPointerCancel={disabled ? undefined : handlePointerUp}
        onDoubleClick={onDoubleClick}
      >
        {children}
      </div>
    </div>
  );
}
