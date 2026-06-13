import type { AuthResponse, AuthUser } from "@/lib/api/types";

export interface AuthStoreState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  hasHydrated: boolean;
}

export interface AuthStoreActions {
  setHasHydrated: (value: boolean) => void;
  setSession: (session: AuthResponse) => void;
  clearSession: () => void;
}

export type AuthStore = AuthStoreState & AuthStoreActions;

export interface UiStoreState {
  activeChatId: string | null;
  isSidebarOpen: boolean;
}

export interface UiStoreActions {
  setActiveChatId: (chatId: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export type UiStore = UiStoreState & UiStoreActions;
