"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccessToken, useAuthUser } from "@/store/selector";
import {
  buildOptimisticDmMessage,
  replaceOptimisticMessages,
} from "../optimistic";
import { realtimeRefetchInterval } from "../query-polling";
import {
  patchMessageInCaches,
  replaceMessageInCaches,
  restoreMessageListSnapshots,
  snapshotMessageListCaches,
  toggleReactionOnMessage,
} from "../message-cache";
import { queryKeys } from "../query-keys";
import { messageService } from "../services/message.service";
import type { ForwardMessagesDto, Message, SendMessageDto } from "../types";

export function useConversation(otherUserId: string | undefined) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.messages.conversation(otherUserId ?? ""),
    queryFn: () => messageService.conversation(otherUserId as string),
    enabled: Boolean(accessToken) && Boolean(otherUserId),
  });
}

type SendMessageInput = SendMessageDto | SendMessageDto[];

async function sendMessages(input: SendMessageInput): Promise<Message[]> {
  const dtos = Array.isArray(input) ? input : [input];
  return Promise.all(dtos.map((dto) => messageService.send(dto)));
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const me = useAuthUser();

  return useMutation({
    mutationFn: sendMessages,
    onMutate: async (input) => {
      const dtos = Array.isArray(input) ? input : [input];
      const recipientId = dtos[0]?.recipientId;
      if (!me?.id || !recipientId) return;

      const key = queryKeys.messages.conversation(recipientId);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Message[]>(key);
      const existing = previous ?? [];
      const optimisticMessages = dtos.map((dto) =>
        buildOptimisticDmMessage(dto, me, existing),
      );
      const optimisticIds = optimisticMessages.map((message) => message.id);

      queryClient.setQueryData<Message[]>(key, [
        ...existing,
        ...optimisticMessages,
      ]);

      return { key, previous, optimisticIds };
    },
    onError: (_error, _input, context) => {
      if (context?.key) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSuccess: (serverMessages, input, context) => {
      const recipientId = (Array.isArray(input) ? input[0] : input).recipientId;
      const key =
        context?.key ?? queryKeys.messages.conversation(recipientId);
      const optimisticIds = context?.optimisticIds ?? [];

      queryClient.setQueryData<Message[]>(key, (current) => {
        const base = current ?? context?.previous ?? [];
        return replaceOptimisticMessages(base, optimisticIds, serverMessages);
      });
    },
    onSettled: (_data, _error, input) => {
      const recipientId = (Array.isArray(input) ? input[0] : input).recipientId;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.inbox.all,
        refetchType: "none",
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversation(recipientId),
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
  const me = useAuthUser();

  return useMutation({
    mutationFn: ({ id, emoji }: { id: string; emoji: string }) =>
      messageService.toggleReaction(id, emoji),
    onMutate: async ({ id, emoji }) => {
      const meId = me?.id;
      if (!meId) return;

      await queryClient.cancelQueries({ queryKey: queryKeys.messages.all });
      await queryClient.cancelQueries({ queryKey: queryKeys.conversations.all });

      const snapshots = snapshotMessageListCaches(queryClient);

      patchMessageInCaches(queryClient, id, (message) =>
        toggleReactionOnMessage(message, meId, emoji),
      );

      return { snapshots };
    },
    onSuccess: (updatedMessage) => {
      replaceMessageInCaches(queryClient, updatedMessage);
    },
    onError: (_error, _vars, context) => {
      restoreMessageListSnapshots(queryClient, context?.snapshots);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages.all,
        refetchType: "none",
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
        refetchType: "none",
      });
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
