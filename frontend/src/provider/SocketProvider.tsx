"use client";

import { queryKeys, type UserPresence } from "@/lib/api";
import { getCurrentUserId } from "@/lib/api/auth-token";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useAccessToken } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

function cachePresence(
  queryClient: ReturnType<typeof useQueryClient>,
  presence: UserPresence,
) {
  queryClient.setQueryData(queryKeys.users.presence(presence.userId), presence);
}

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

    socket.on("dm.received", (payload: { id?: string; recipientId?: string; senderId?: string }) => {
      const meId = getCurrentUserId();
      if (meId && payload?.recipientId === meId && payload?.id) {
        socket.emit("dm.delivered", { messageId: payload.id });
      }
      if (payload?.senderId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.messages.conversation(payload.senderId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.dms(false) });
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.unreadCount() });
    });

    socket.on("message.delivered", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    });

    socket.on("messages.read", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
    });

    socket.on("group.messages.read", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    });

    socket.on("presence.online", (payload: UserPresence) => {
      cachePresence(queryClient, {
        userId: payload.userId,
        online: true,
        lastSeenAt: null,
      });
    });

    socket.on("presence.offline", (payload: UserPresence) => {
      cachePresence(queryClient, {
        userId: payload.userId,
        online: false,
        lastSeenAt: payload.lastSeenAt ?? null,
      });
    });

    socket.on("presence.sync", (payload: { users?: UserPresence[] }) => {
      for (const user of payload?.users ?? []) {
        cachePresence(queryClient, user);
      }
    });

    socket.on("conversation.cleared", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
    });

    socket.on("group.message.received", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
    });

    socket.on("message.updated", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    });

    socket.on("message.deleted", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    });

    socket.on("group.updated", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    });

    socket.on("group.cleared", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    });

    socket.on("group.removed", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    });

    socket.on("notification.created", () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      });
    });

    return () => {
      socket.off("dm.received");
      socket.off("message.delivered");
      socket.off("messages.read");
      socket.off("group.messages.read");
      socket.off("presence.online");
      socket.off("presence.offline");
      socket.off("presence.sync");
      socket.off("conversation.cleared");
      socket.off("group.message.received");
      socket.off("message.updated");
      socket.off("message.deleted");
      socket.off("group.updated");
      socket.off("group.cleared");
      socket.off("group.removed");
      socket.off("notification.created");
      disconnectSocket();
    };
  }, [accessToken, queryClient]);

  return <>{children}</>;
}
