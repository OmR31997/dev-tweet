"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccessToken } from "@/store/selector";
import { realtimeRefetchInterval } from "../query-polling";
import { queryKeys } from "../query-keys";
import { conversationService } from "../services/conversation.service";
import type {
  CreateGroupDto,
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
  return useMutation({
    mutationFn: (dto: SendGroupMessageDto) =>
      conversationService.sendMessage(conversationId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.messages(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.inbox.all });
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
