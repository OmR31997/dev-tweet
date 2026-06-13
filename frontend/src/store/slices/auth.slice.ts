import { AUTH_TOKEN_KEY } from "@/config/auth";
import type { AuthStore } from "@/store/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

function syncTokenToStorage(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      setSession: (session) => {
        syncTokenToStorage(session.accessToken);
        set({
          user: session.user,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken ?? null,
        });
      },

      clearSession: () => {
        syncTokenToStorage(null);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: "devtweethub-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error && state?.accessToken) {
          syncTokenToStorage(state.accessToken);
        }
        state?.setHasHydrated(true);
      },
    }
  )
);
