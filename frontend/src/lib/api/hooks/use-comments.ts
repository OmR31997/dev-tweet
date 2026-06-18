"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccessToken, useAuthUser } from "@/store/selector";
import { buildOptimisticComment, isOptimisticId } from "../optimistic";
import { queryKeys } from "../query-keys";
import { commentService } from "../services/comment.service";
import type { Comment, CreateCommentDto, Post } from "../types";

export function useComments(postId: string, enabled = true) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.comments.forPost(postId),
    queryFn: () => commentService.list(postId),
    enabled: Boolean(accessToken) && Boolean(postId) && enabled,
  });
}

function bumpPostCommentCount(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  delta: number,
) {
  queryClient.setQueriesData<Post[]>(
    { queryKey: queryKeys.posts.all },
    (posts) =>
      posts?.map((post) =>
        post.id === postId
          ? { ...post, commentCount: Math.max(0, post.commentCount + delta) }
          : post,
      ),
  );
}

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();
  const me = useAuthUser();

  return useMutation({
    mutationFn: (dto: CreateCommentDto) => commentService.create(postId, dto),
    onMutate: async (dto) => {
      if (!me?.id) return;

      const key = queryKeys.comments.forPost(postId);
      await queryClient.cancelQueries({ queryKey: key });
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });

      const previous = queryClient.getQueryData<Comment[]>(key);
      const optimistic = buildOptimisticComment(postId, dto, me);

      queryClient.setQueryData<Comment[]>(key, (old) => [
        ...(old ?? []),
        optimistic,
      ]);
      bumpPostCommentCount(queryClient, postId, 1);

      return { key, previous, optimisticId: optimistic.id };
    },
    onError: (_error, _dto, context) => {
      if (context?.key) {
        queryClient.setQueryData(context.key, context.previous);
      }
      bumpPostCommentCount(queryClient, postId, -1);
    },
    onSuccess: (comment, _dto, context) => {
      const key = context?.key ?? queryKeys.comments.forPost(postId);
      const optimisticId = context?.optimisticId;

      queryClient.setQueryData<Comment[]>(key, (current) => {
        const base = current ?? [];
        if (!optimisticId) {
          return base.some((item) => item.id === comment.id)
            ? base
            : [...base, comment];
        }
        return base.map((item) => (item.id === optimisticId ? comment : item));
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.comments.forPost(postId),
        refetchType: "none",
      });
    },
  });
}

export function useToggleCommentLike(postId: string) {
  const queryClient = useQueryClient();
  const me = useAuthUser();

  return useMutation({
    mutationFn: (id: string) => commentService.toggleLike(id),
    onMutate: async (commentId) => {
      const meId = me?.id;
      if (!meId) return;

      const key = queryKeys.comments.forPost(postId);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Comment[]>(key);
      queryClient.setQueryData<Comment[]>(key, (old) =>
        old?.map((comment) => {
          if (comment.id !== commentId) return comment;
          const liked = comment.likes.includes(meId);
          return {
            ...comment,
            likes: liked
              ? comment.likes.filter((userId) => userId !== meId)
              : [...comment.likes, meId],
          };
        }),
      );

      return { key, previous };
    },
    onError: (_error, _id, context) => {
      if (context?.key) {
        queryClient.setQueryData(context.key, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.comments.forPost(postId),
        refetchType: "none",
      });
    },
  });
}

export function useDeleteComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentService.remove(id),
    onMutate: async (commentId) => {
      const key = queryKeys.comments.forPost(postId);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Comment[]>(key);
      queryClient.setQueryData<Comment[]>(key, (old) =>
        old?.filter((comment) => comment.id !== commentId),
      );
      if (!isOptimisticId(commentId)) {
        bumpPostCommentCount(queryClient, postId, -1);
      }

      return { key, previous, commentId };
    },
    onError: (_error, _id, context) => {
      if (context?.key) {
        queryClient.setQueryData(context.key, context.previous);
      }
      if (context?.commentId && !isOptimisticId(context.commentId)) {
        bumpPostCommentCount(queryClient, postId, 1);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.forPost(postId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
