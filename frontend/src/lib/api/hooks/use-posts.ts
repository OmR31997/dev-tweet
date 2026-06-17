"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccessToken } from "@/store/selector";
import { useAuthUser } from "@/store/selector";
import { realtimeRefetchInterval } from "../query-polling";
import { queryKeys } from "../query-keys";
import { postService } from "../services/post.service";
import type { CreatePostDto, Post, RepostPostDto, UpdatePostDto } from "../types";

type PostsQueryOptions = {
  /** Disable background polling (e.g. profile page). */
  poll?: boolean;
};

/** Feed or search. */
export function usePosts(q?: string, limit = 50, options?: PostsQueryOptions) {
  const accessToken = useAccessToken();
  const poll = options?.poll !== false;

  return useQuery({
    queryKey: queryKeys.posts.feed(q),
    queryFn: () => postService.list(q, limit),
    enabled: Boolean(accessToken),
    staleTime: poll ? 60_000 : 5 * 60_000,
    refetchInterval: poll ? () => realtimeRefetchInterval(90_000) : false,
  });
}

function patchPostsInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  patch: (post: Post) => Post,
) {
  queryClient.setQueriesData<Post[]>(
    { queryKey: queryKeys.posts.all },
    (old) => old?.map((post) => (post.id === postId ? patch(post) : post)),
  );
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
  const me = useAuthUser();

  return useMutation({
    mutationFn: (id: string) => postService.toggleLike(id),
    onMutate: async (postId) => {
      const meId = me?.id;
      if (!meId) return;

      await queryClient.cancelQueries({ queryKey: queryKeys.posts.all });
      const snapshots = queryClient.getQueriesData<Post[]>({
        queryKey: queryKeys.posts.all,
      });

      patchPostsInCache(queryClient, postId, (post) => {
        const liked = post.likes.includes(meId);
        return {
          ...post,
          likes: liked
            ? post.likes.filter((userId) => userId !== meId)
            : [...post.likes, meId],
        };
      });

      return { snapshots };
    },
    onError: (_error, _postId, context) => {
      for (const [key, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
    onSuccess: (result, postId) => {
      const meId = me?.id;
      if (!meId) return;
      patchPostsInCache(queryClient, postId, (post) => {
        const liked = result.liked;
        const hasLike = post.likes.includes(meId);
        if (liked === hasLike) return post;
        return {
          ...post,
          likes: liked
            ? hasLike
              ? post.likes
              : [...post.likes, meId]
            : post.likes.filter((userId) => userId !== meId),
        };
      });
    },
  });
}

export function useToggleRepost() {
  const queryClient = useQueryClient();
  const me = useAuthUser();

  return useMutation({
    mutationFn: ({ id, caption }: { id: string; caption?: string }) =>
      postService.toggleRepost(id, caption ? { caption } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      if (me?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(me.id),
        });
      }
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
    onSuccess: (_result, id) => {
      queryClient.setQueriesData<Post[]>(
        { queryKey: queryKeys.posts.all },
        (old) => old?.filter((post) => post.id !== id),
      );
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => postService.uploadImage(file),
  });
}
