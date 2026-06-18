"use client";

import { useCallback, useRef } from "react";

const TAP_SLOP_PX = 12;

/**
 * Ignores pointer ups that moved enough to count as a scroll gesture.
 * Keeps keyboard and mouse clicks working without double-firing on touch.
 */
export function useTapOnly(onTap: () => void) {
  const origin = useRef<{ x: number; y: number } | null>(null);
  const handledByPointer = useRef(false);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    origin.current = { x: event.clientX, y: event.clientY };
  }, []);

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      const start = origin.current;
      origin.current = null;
      if (!start) return;

      const dx = Math.abs(event.clientX - start.x);
      const dy = Math.abs(event.clientY - start.y);
      if (dx > TAP_SLOP_PX || dy > TAP_SLOP_PX) return;

      handledByPointer.current = true;
      onTap();
    },
    [onTap],
  );

  const onPointerCancel = useCallback(() => {
    origin.current = null;
  }, []);

  const onClick = useCallback(
    (event: React.MouseEvent) => {
      if (handledByPointer.current) {
        handledByPointer.current = false;
        event.preventDefault();
        return;
      }
      onTap();
    },
    [onTap],
  );

  return { onPointerDown, onPointerUp, onPointerCancel, onClick };
}
