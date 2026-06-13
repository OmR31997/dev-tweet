"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAccessToken } from "@/store/selector";
import { authActions } from "@/store/action";
import { queryKeys } from "../query-keys";
import { userService } from "../services/user.service";
import type { AuthUser, UpdateProfileDto } from "../types";

/** Search / list the user directory. */
export function useUsers(q?: string, limit = 25) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: queryKeys.users.list(q),
    queryFn: () => userService.list(q, limit),
    enabled: Boolean(accessToken),
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
  return useMutation({
    mutationFn: (id: string) => userService.toggleFollow(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}
