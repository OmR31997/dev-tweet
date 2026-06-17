"use client";

import { useCallback, useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";

const TYPING_THROTTLE_MS = 2_000;
const TYPING_STOP_MS = 1_500;

export function useTypingEmitter(recipientId: string | undefined) {
  const lastStartRef = useRef(0);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTyping = useCallback(() => {
    if (!recipientId) return;
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    getSocket()?.emit("typing.stop", { recipientId });
  }, [recipientId]);

  const emitTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !recipientId) return;

    const now = Date.now();
    if (now - lastStartRef.current >= TYPING_THROTTLE_MS) {
      socket.emit("typing.start", { recipientId });
      lastStartRef.current = now;
    }

    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(stopTyping, TYPING_STOP_MS);
  }, [recipientId, stopTyping]);

  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      if (recipientId) {
        getSocket()?.emit("typing.stop", { recipientId });
      }
    };
  }, [recipientId]);

  return { emitTyping, stopTyping };
}
