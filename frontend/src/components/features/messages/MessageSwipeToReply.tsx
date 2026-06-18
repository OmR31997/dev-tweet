"use client";

import { cn } from "@/lib/utils";
import { Reply } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect } from "react";
import { useDoubleTap } from "./use-double-tap";
import { useLongPress } from "./use-long-press";
import { useSwipeToReply } from "./use-swipe-to-reply";

export function MessageSwipeToReply({
  mine,
  disabled,
  onReply,
  onLongPress,
  onDoubleTap,
  onDoubleClick,
  children,
}: {
  mine: boolean;
  disabled?: boolean;
  onReply: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  children: ReactNode;
}) {
  const swipe = useSwipeToReply({ mine, disabled, onReply });
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

  const { registerPointerUp, reset: resetDoubleTap } = useDoubleTap(() => {
    onDoubleTap?.();
  });

  const handleLongPress = useCallback(() => {
    reset();
    resetDoubleTap();
    onLongPress?.();
  }, [onLongPress, reset, resetDoubleTap]);

  const longPress = useLongPress(handleLongPress);

  useEffect(() => {
    if (disabled) {
      reset();
      resetDoubleTap();
      longPress.reset();
    }
  }, [disabled, longPress, reset, resetDoubleTap]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown(event);
    if (!disabled && onLongPress) {
      longPress.onPointerDown(event);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove(event);
    if (!disabled && onLongPress) {
      longPress.onPointerMove(event);
    }
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const moved = didMove();
    const longPressed = onLongPress ? longPress.consumeLongPress() : false;

    onPointerUp(event);
    if (!disabled && onLongPress) {
      longPress.onPointerUp();
    }

    if (!disabled && onDoubleTap && !longPressed) {
      registerPointerUp(event, moved);
    }
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
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
        onPointerDown={disabled ? undefined : handlePointerDown}
        onPointerMove={disabled ? undefined : handlePointerMove}
        onPointerUp={disabled ? undefined : handlePointerUp}
        onPointerCancel={disabled ? undefined : handlePointerUp}
        onContextMenu={handleContextMenu}
        onDoubleClick={onDoubleClick}
      >
        {children}
      </div>
    </div>
  );
}
