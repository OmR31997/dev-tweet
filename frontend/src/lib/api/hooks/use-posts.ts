"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccessToken } from "@/store/selector";
import { queryKeys } from "../query-keys";
import { postService } from "../services/post.service";
import type { CreatePostDto, UpdatePostDto } from "../types";

/** Feed or search. */
export function usePosts(q?: string, limit = 50) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.posts.feed(q),
    queryFn: () => postService.list(q, limit),
    enabled: Boolean(accessToken),
    refetchInterval: 20_000,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreatePostDto) => postService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useToggleRepost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.toggleRepost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePostDto }) =>
      postService.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => postService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => postService.uploadImage(file),
  });
}
