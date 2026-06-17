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
  return useQuery({
    queryKey: queryKeys.users.detail(id ?? ""),
    queryFn: () => userService.byId(id as string),
    enabled: Boolean(accessToken) && Boolean(id),
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
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.followers(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.following(id) });
      if (me?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(me.id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.followers(me.id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.following(me.id),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
