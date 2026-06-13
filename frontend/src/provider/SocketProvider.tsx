"use client";

import { queryKeys } from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useAccessToken } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

/**
 * Maintains the realtime socket connection for the signed-in user and pushes
 * incoming events into the React Query cache (new DMs, notifications).
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) return;

    const socket = connectSocket(accessToken);

    socket.on("dm.received", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    });

    socket.on("notification.created", () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    });

    return () => {
      socket.off("dm.received");
      socket.off("notification.created");
      disconnectSocket();
    };
  }, [accessToken, queryClient]);

  return <>{children}</>;
}
