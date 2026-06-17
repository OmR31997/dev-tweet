import type { AuthStore } from "@/store/types";
import { useAuthStore } from "@/store/slices/auth.slice";
import { useShallow } from "zustand/react/shallow";

export const authSelectors = {
  user: (state: AuthStore) => state.user,
  accessToken: (state: AuthStore) => state.accessToken,
  refreshToken: (state: AuthStore) => state.refreshToken,
  hasHydrated: (state: AuthStore) => state.hasHydrated,
  isAuthenticated: (state: AuthStore) => Boolean(state.accessToken),
  displayName: (state: AuthStore) =>
    state.user?.displayName ?? state.user?.email ?? null,
};

export function useAuthUser() {
  return useAuthStore(authSelectors.user);
}

export function useAccessToken() {
  return useAuthStore(authSelectors.accessToken);
}

export function useRefreshToken() {
  return useAuthStore(authSelectors.refreshToken);
}

export function useIsAuthenticated() {
  return useAuthStore(authSelectors.isAuthenticated);
}

export function useAuthHasHydrated() {
  return useAuthStore(authSelectors.hasHydrated);
}

export function useAuthDisplayName() {
  return useAuthStore(authSelectors.displayName);
}

/** Auth user + hydration flag (shallow compare). */
export function useAuthState() {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      accessToken: state.accessToken,
      hasHydrated: state.hasHydrated,
      isAuthenticated: Boolean(state.accessToken),
      displayName: state.user?.displayName ?? state.user?.email ?? null,
    }))
  );
}
