"use client";

import { useCallback, useEffect, useRef } from "react";

const LONG_PRESS_MS = 520;
const MOVE_SLOP_PX = 10;

/**
 * Long-press for touch/pen (opens message action menu on mobile; mouse uses double-click).
 */
export function useLongPress(onLongPress: () => void) {
  const callbackRef = useRef(onLongPress);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    callbackRef.current = onLongPress;
  }, [onLongPress]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    originRef.current = null;
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    firedRef.current = false;
  }, [clearTimer]);

  const onPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType === "mouse" || event.button !== 0) return;

      clearTimer();
      firedRef.current = false;
      originRef.current = { x: event.clientX, y: event.clientY };

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        originRef.current = null;
        firedRef.current = true;
        callbackRef.current();
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(12);
        }
      }, LONG_PRESS_MS);
    },
    [clearTimer],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent) => {
      const origin = originRef.current;
      if (!origin || !timerRef.current) return;

      const dx = Math.abs(event.clientX - origin.x);
      const dy = Math.abs(event.clientY - origin.y);
      if (dx > MOVE_SLOP_PX || dy > MOVE_SLOP_PX) {
        clearTimer();
      }
    },
    [clearTimer],
  );

  const onPointerUp = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const consumeLongPress = useCallback(() => {
    const fired = firedRef.current;
    firedRef.current = false;
    return fired;
  }, []);

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    reset,
    consumeLongPress,
  };
}
