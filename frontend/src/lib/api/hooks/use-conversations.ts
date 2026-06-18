"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccessToken, useAuthUser } from "@/store/selector";
import {
  buildOptimisticGroupMessage,
  replaceOptimisticMessages,
} from "../optimistic";
import { realtimeRefetchInterval } from "../query-polling";
import { queryKeys } from "../query-keys";
import { conversationService } from "../services/conversation.service";
import type {
  CreateGroupDto,
  Message,
  SendGroupMessageDto,
  UpdateGroupDto,
} from "../types";

export function useConversations(archived = false) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.conversations.list(archived),
    queryFn: () => conversationService.list(archived),
    enabled: Boolean(accessToken),
    refetchInterval: () => realtimeRefetchInterval(90_000),
  });
}

export function useGroupConversation(conversationId: string | undefined) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.conversations.detail(conversationId ?? ""),
    queryFn: () => conversationService.getById(conversationId as string),
    enabled: Boolean(accessToken) && Boolean(conversationId),
  });
}

export function useGroupMessages(conversationId: string | undefined) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.conversations.messages(conversationId ?? ""),
    queryFn: () => conversationService.messages(conversationId as string),
    enabled: Boolean(accessToken) && Boolean(conversationId),
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateGroupDto) => conversationService.createGroup(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
    },
  });
}

export function useUpdateGroup(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateGroupDto) =>
      conversationService.updateGroup(conversationId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.detail(conversationId),
      });
    },
  });
}

export function useSendGroupMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const me = useAuthUser();

  return useMutation({
    mutationFn: async (input: SendGroupMessageDto | SendGroupMessageDto[]) => {
      const dtos = Array.isArray(input) ? input : [input];
      return Promise.all(
        dtos.map((dto) => conversationService.sendMessage(conversationId, dto)),
      );
    },
    onMutate: async (input) => {
      const dtos = Array.isArray(input) ? input : [input];
      if (!me?.id) return;

      const key = queryKeys.conversations.messages(conversationId);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Message[]>(key);
      const existing = previous ?? [];
      const optimisticMessages = dtos.map((dto) =>
        buildOptimisticGroupMessage(dto, conversationId, me, existing),
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
    onSuccess: (serverMessages, _input, context) => {
      const key =
        context?.key ?? queryKeys.conversations.messages(conversationId);
      const optimisticIds = context?.optimisticIds ?? [];

      queryClient.setQueryData<Message[]>(key, (current) => {
        const base = current ?? context?.previous ?? [];
        return replaceOptimisticMessages(base, optimisticIds, serverMessages);
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
        refetchType: "none",
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.inbox.all,
        refetchType: "none",
      });
    },
  });
}

export function useMarkGroupRead(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => conversationService.markRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
    },
  });
}

export function useClearGroupChat(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => conversationService.clear(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
    },
  });
}

export function useClearGroupChatForEveryone(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => conversationService.clearForEveryone(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
    },
  });
}

function invalidateGroup(conversationId: string, queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
  queryClient.invalidateQueries({
    queryKey: queryKeys.conversations.detail(conversationId),
  });
}

export function usePromoteGroupMember(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      conversationService.promoteAdmin(conversationId, userId),
    onSuccess: () => invalidateGroup(conversationId, queryClient),
  });
}

export function useDemoteGroupMember(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      conversationService.demoteAdmin(conversationId, userId),
    onSuccess: () => invalidateGroup(conversationId, queryClient),
  });
}

export function useRemoveGroupMember(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      conversationService.removeParticipant(conversationId, userId),
    onSuccess: () => invalidateGroup(conversationId, queryClient),
  });
}

export function useAddGroupMember(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      conversationService.addParticipant(conversationId, userId),
    onSuccess: () => {
      invalidateGroup(conversationId, queryClient);
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
    },
  });
}

function invalidateArchiveLists(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
}

export function useArchiveGroupChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.archive(conversationId),
    onSuccess: () => invalidateArchiveLists(queryClient),
  });
}

export function useUnarchiveGroupChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationService.unarchive(conversationId),
    onSuccess: () => invalidateArchiveLists(queryClient),
  });
}
