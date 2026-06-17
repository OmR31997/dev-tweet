"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccessToken } from "@/store/selector";
import { realtimeRefetchInterval } from "../query-polling";
import { queryKeys } from "../query-keys";
import { messageService } from "../services/message.service";
import type { ForwardMessagesDto, SendMessageDto } from "../types";

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
      if (msg.recipientId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.messages.conversation(msg.recipientId),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
    },
  });
}

export function useClearConversationForEveryone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otherUserId: string) =>
      messageService.clearForEveryone(otherUserId),
    onSuccess: (_d, otherUserId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(otherUserId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
    },
  });
}

export function useUnreadMessageCount() {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.messages.unreadCount(),
    queryFn: () => messageService.unreadCount(),
    enabled: Boolean(accessToken),
    refetchInterval: () => realtimeRefetchInterval(90_000),
  });
}

export function useToggleMessageReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, emoji }: { id: string; emoji: string }) =>
      messageService.toggleReaction(id, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
  });
}

export function useDeleteMessages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageIds,
      forEveryone = true,
    }: {
      messageIds: string[];
      forEveryone?: boolean;
    }) => messageService.deleteBulk(messageIds, forEveryone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
  });
}

export function useDeleteMessageForMe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => messageService.deleteItemForMe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
  });
}

export function useDeleteMessageForEveryone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => messageService.deleteItemForEveryone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
  });
}

export function useForwardMessages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ForwardMessagesDto) => messageService.forward(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
    },
  });
}

export function useDmChats(archived = false) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.inbox.dms(archived),
    queryFn: () => messageService.listChats(archived),
    enabled: Boolean(accessToken),
    refetchInterval: () => realtimeRefetchInterval(90_000),
  });
}

export function useArchivedChatCount() {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.inbox.archivedCount(),
    queryFn: () => messageService.archivedCount(),
    enabled: Boolean(accessToken),
    refetchInterval: () => realtimeRefetchInterval(120_000),
  });
}

export function useArchiveDmChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otherUserId: string) => messageService.archive(otherUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
  });
}

export function useUnarchiveDmChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (otherUserId: string) => messageService.unarchive(otherUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
  });
}
