"use client";

import { useCallback, useRef, useState } from "react";

const MAX_OFFSET = 72;
const TRIGGER_OFFSET = 56;
const DRAG_THRESHOLD = 8;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function useSwipeToReply({
  mine,
  disabled,
  onReply,
}: {
  mine: boolean;
  disabled?: boolean;
  onReply: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const activePointer = useRef<number | null>(null);
  const isDragging = useRef(false);

  const reset = useCallback(() => {
    setDragging(false);
    setOffset(0);
    activePointer.current = null;
    isDragging.current = false;
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || event.button !== 0) return;
      activePointer.current = event.pointerId;
      startX.current = event.clientX;
      startY.current = event.clientY;
      startOffset.current = offset;
      isDragging.current = false;
    },
    [disabled, offset],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || activePointer.current !== event.pointerId) return;

      const deltaX = event.clientX - startX.current;
      const deltaY = event.clientY - startY.current;

      if (!isDragging.current) {
        if (
          Math.abs(deltaX) < DRAG_THRESHOLD &&
          Math.abs(deltaY) < DRAG_THRESHOLD
        ) {
          return;
        }
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          activePointer.current = null;
          return;
        }
        isDragging.current = true;
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      const next = startOffset.current + deltaX;
      setOffset(
        mine ? clamp(next, -MAX_OFFSET, 0) : clamp(next, 0, MAX_OFFSET),
      );
    },
    [disabled, mine],
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (activePointer.current !== event.pointerId) return;

      if (isDragging.current && Math.abs(offset) >= TRIGGER_OFFSET) {
        onReply();
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      reset();
    },
    [offset, onReply, reset],
  );

  const hintVisible = Math.abs(offset) >= 24;

  return {
    offset,
    dragging,
    hintVisible,
    reset,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  };
}
