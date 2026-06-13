import { useAuthStore } from "@/store/slices/auth.slice";
import type { AuthResponse } from "@/lib/api/types";

/** Imperative auth actions (for services, interceptors, non-React code). */
export const authActions = {
  setSession: (session: AuthResponse) => {
    useAuthStore.getState().setSession(session);
  },

  clearSession: () => {
    useAuthStore.getState().clearSession();
  },

  getAccessToken: () => useAuthStore.getState().accessToken,

  getUser: () => useAuthStore.getState().user,

  getState: () => useAuthStore.getState(),
};
