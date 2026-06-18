"use client";

import { useCallback, useRef } from "react";

const TAP_SLOP_PX = 12;

/** Reliable tap handler for touch + mouse (avoids ghost clicks on mobile overlays). */
export function usePointerTap(onTap: () => void) {
  const origin = useRef<{ x: number; y: number } | null>(null);
  const handled = useRef(false);

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

      event.preventDefault();
      event.stopPropagation();
      handled.current = true;
      onTap();
    },
    [onTap],
  );

  const onPointerCancel = useCallback(() => {
    origin.current = null;
  }, []);

  const onClick = useCallback(
    (event: React.MouseEvent) => {
      if (handled.current) {
        handled.current = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      onTap();
    },
    [onTap],
  );

  return { onPointerDown, onPointerUp, onPointerCancel, onClick };
}
