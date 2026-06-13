"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccessToken } from "@/store/selector";
import { queryKeys } from "../query-keys";
import { messageService } from "../services/message.service";
import type { SendMessageDto } from "../types";

export function useConversation(otherUserId: string | undefined) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.messages.conversation(otherUserId ?? ""),
    queryFn: () => messageService.conversation(otherUserId as string),
    enabled: Boolean(accessToken) && Boolean(otherUserId),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: SendMessageDto) => messageService.send(dto),
    onSuccess: (msg) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(msg.recipientId),
      });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otherUserId: string) => messageService.markRead(otherUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.unreadCount(),
      });
    },
  });
}

export function useClearConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otherUserId: string) => messageService.clear(otherUserId),
    onSuccess: (_d, otherUserId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(otherUserId),
      });
    },
  });
}

export function useUnreadMessageCount() {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.messages.unreadCount(),
    queryFn: () => messageService.unreadCount(),
    enabled: Boolean(accessToken),
    refetchInterval: 15_000,
  });
}
