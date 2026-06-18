"use client";

import { useCallback, useRef } from "react";

const DOUBLE_TAP_MS = 280;
const TAP_SLOP_PX = 24;

/**
 * Detects double-tap on touch/pen pointers (mobile does not fire dblclick reliably).
 */
export function useDoubleTap(onDoubleTap: () => void) {
  const lastTap = useRef<{ time: number; x: number; y: number } | null>(null);

  const reset = useCallback(() => {
    lastTap.current = null;
  }, []);

  const registerPointerUp = useCallback(
    (event: React.PointerEvent, moved: boolean) => {
      if (moved) {
        lastTap.current = null;
        return false;
      }

      if (event.pointerType === "mouse") {
        return false;
      }

      const now = Date.now();
      const point = { time: now, x: event.clientX, y: event.clientY };
      const previous = lastTap.current;

      if (
        previous &&
        now - previous.time <= DOUBLE_TAP_MS &&
        Math.hypot(point.x - previous.x, point.y - previous.y) <= TAP_SLOP_PX
      ) {
        lastTap.current = null;
        event.preventDefault();
        event.stopPropagation();
        onDoubleTap();
        return true;
      }

      lastTap.current = point;
      return false;
    },
    [onDoubleTap],
  );

  return { registerPointerUp, reset };
}
