"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccessToken } from "@/store/selector";
import { queryKeys } from "../query-keys";
import { notificationService } from "../services/notification.service";

export function useNotifications() {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationService.list(),
    enabled: Boolean(accessToken),
    refetchInterval: 15_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useClearNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.clear(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
