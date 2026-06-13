"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccessToken } from "@/store/selector";
import { queryKeys } from "../query-keys";
import { commentService } from "../services/comment.service";
import type { CreateCommentDto } from "../types";

export function useComments(postId: string, enabled = true) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.comments.forPost(postId),
    queryFn: () => commentService.list(postId),
    enabled: Boolean(accessToken) && Boolean(postId) && enabled,
  });
}

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCommentDto) => commentService.create(postId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.forPost(postId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useToggleCommentLike(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentService.toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.forPost(postId),
      });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.forPost(postId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
