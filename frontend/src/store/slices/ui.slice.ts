import type { UiStore } from "@/store/types";
import { create } from "zustand";

export const useUiStore = create<UiStore>((set) => ({
  activeChatId: null,
  isSidebarOpen: true,

  setActiveChatId: (chatId) => set({ activeChatId: chatId }),

  setSidebarOpen: (open) => set({ isSidebarOpen: open }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
