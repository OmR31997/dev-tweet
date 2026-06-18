"use client";

import { useCallback, useEffect, useRef } from "react";

const DISMISS_ARM_MS = 320;

/**
 * Prevents the pointer event that opened an overlay from immediately dismissing it
 * (common on mobile when backdrop mounts in the same click/tap cycle).
 */
export function useOverlayDismiss(open: boolean, onDismiss: () => void) {
  const armedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      armedRef.current = false;
      return;
    }

    armedRef.current = false;
    const timer = window.setTimeout(() => {
      armedRef.current = true;
    }, DISMISS_ARM_MS);

    return () => clearTimeout(timer);
  }, [open]);

  const onBackdropPointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.target !== event.currentTarget || !armedRef.current) return;
      event.preventDefault();
      onDismiss();
    },
    [onDismiss],
  );

  return { onBackdropPointerDown };
}
