"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authActions, uiActions } from "@/store/action";
import {
  useAccessToken,
  useAuthHasHydrated,
  useAuthUser,
} from "@/store/selector";
import { queryKeys } from "../query-keys";
import { authService } from "../services/auth.service";
import type {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from "../types";

/** Fetch + sync the current authenticated user (GET /users/me). */
export function useCurrentUser() {
  const accessToken = useAccessToken();
  const hasHydrated = useAuthHasHydrated();

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const user = await authService.getMe();
      const token = authActions.getAccessToken();
      if (token) {
        authActions.setSession({
          user,
          accessToken: token,
          refreshToken: authActions.getState().refreshToken ?? undefined,
        });
      }
      return user;
    },
    enabled: hasHydrated && Boolean(accessToken),
    retry: false,
  });
}

export function useAuthSession() {
  const storeUser = useAuthUser();
  const accessToken = useAccessToken();
  const hasHydrated = useAuthHasHydrated();
  const query = useCurrentUser();

  const user = storeUser ?? query.data;

  return {
    user,
    isAuthenticated: Boolean(accessToken),
    isLoading:
      !hasHydrated || (Boolean(accessToken) && query.isLoading && !storeUser),
    isError: query.isError && !storeUser,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useLogin(options?: { redirectTo?: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const redirectTo = options?.redirectTo ?? "/feed";

  return useMutation({
    mutationFn: (dto: LoginDto) => authService.login(dto),
    onSuccess: () => {
      // Session is already in the store; navigate immediately and refresh
      // /users/me in the background (no blocking router.refresh()).
      router.replace(redirectTo);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useRegister(options?: { redirectTo?: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const redirectTo = options?.redirectTo ?? "/feed";

  return useMutation({
    mutationFn: (dto: RegisterDto) => authService.register(dto),
    onSuccess: () => {
      router.replace(redirectTo);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (dto: ForgotPasswordDto) => authService.forgotPassword(dto),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (dto: ResetPasswordDto) => authService.resetPassword(dto),
  });
}

export function useLogout(options?: { redirectTo?: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const redirectTo = options?.redirectTo ?? "/login";

  return useMutation({
    onMutate: () => {
      authActions.clearSession();
      queryClient.clear();
      uiActions.setActiveChatId(null);
      router.replace(redirectTo);
    },
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch {
        // Session cleared client-side; server sign-out is best-effort.
      }
    },
  });
}
