"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccessToken } from "@/store/selector";
import { authActions } from "@/store/action";
import { useAuthUser } from "@/store/selector";
import { queryKeys } from "../query-keys";
import { userService } from "../services/user.service";
import type { AuthUser, UpdateProfileDto } from "../types";

type UseUsersOptions = {
  /** Extra gate for when the hook should run (e.g. dialog open). */
  enabled?: boolean;
  /** Only fetch when `q` is non-empty — avoids listing the full directory on empty search. */
  searchOnly?: boolean;
};

/** Search / list the user directory. */
export function useUsers(q?: string, limit = 25, options?: UseUsersOptions) {
  const accessToken = useAccessToken();
  const hasQuery = Boolean(q?.trim());
  const enabled =
    Boolean(accessToken) &&
    (options?.enabled ?? true) &&
    (!options?.searchOnly || hasQuery);

  return useQuery({
    queryKey: queryKeys.users.list(q),
    queryFn: () => userService.list(q, limit),
    enabled,
  });
}

export function useUser(id: string | undefined) {
  const accessToken = useAccessToken();
  const me = useAuthUser();

  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ""),
    queryFn: () => userService.byId(id as string),
    enabled: Boolean(accessToken) && Boolean(id),
    placeholderData: (previous) => {
      if (previous) return previous;
      if (id && me?.id === id) return me;
      return undefined;
    },
  });
}

export function useFollowers(userId: string | undefined) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.users.followers(userId ?? ""),
    queryFn: () => userService.followers(userId as string),
    enabled: Boolean(accessToken) && Boolean(userId),
  });
}

export function useFollowing(userId: string | undefined) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.users.following(userId ?? ""),
    queryFn: () => userService.following(userId as string),
    enabled: Boolean(accessToken) && Boolean(userId),
  });
}

export function useUserPresence(userId: string | undefined) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.users.presence(userId ?? ""),
    queryFn: () => userService.presence(userId as string),
    enabled: Boolean(accessToken) && Boolean(userId),
    staleTime: 15_000,
  });
}

export function usePresenceBulk(userIds: string[]) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.users.presenceBulk(userIds),
    queryFn: () => userService.presenceBulk(userIds),
    enabled: Boolean(accessToken) && userIds.length > 0,
    staleTime: 15_000,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProfileDto) => userService.updateProfile(dto),
    onSuccess: (user: AuthUser) => {
      const token = authActions.getAccessToken();
      if (token) {
        authActions.setSession({
          user,
          accessToken: token,
          refreshToken: authActions.getState().refreshToken ?? undefined,
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(user.id) });
    },
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();
  const me = useAuthUser();

  return useMutation({
    mutationFn: (id: string) => userService.toggleFollow(id),
    onMutate: async (targetId) => {
      const meId = me?.id;
      if (!meId) return;

      await queryClient.cancelQueries({ queryKey: queryKeys.users.all });

      const snapshots = queryClient.getQueriesData<AuthUser>({
        queryKey: queryKeys.users.all,
      });

      const patchUser = (user: AuthUser | undefined) => {
        if (!user) return user;
        if (user.id === targetId) {
          const followers = user.followers ?? [];
          const isFollowing = followers.includes(meId);
          return {
            ...user,
            followers: isFollowing
              ? followers.filter((id) => id !== meId)
              : [...followers, meId],
          };
        }
        if (user.id === meId) {
          const following = user.following ?? [];
          const isFollowing = following.includes(targetId);
          return {
            ...user,
            following: isFollowing
              ? following.filter((id) => id !== targetId)
              : [...following, targetId],
          };
        }
        return user;
      };

      queryClient.setQueriesData(
        { queryKey: queryKeys.users.all },
        (old: AuthUser | AuthUser[] | undefined) => {
          if (!old) return old;
          if (Array.isArray(old)) {
            return old.map((user) => patchUser(user) as AuthUser);
          }
          return patchUser(old);
        },
      );

      return { snapshots };
    },
    onError: (_error, _id, context) => {
      for (const [key, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(key, data);
      }
    },
    onSettled: (_data, _error, id) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(id),
        refetchType: "none",
      });
      if (me?.id) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(me.id),
          refetchType: "none",
        });
      }
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
        refetchType: "none",
      });
    },
  });
}
