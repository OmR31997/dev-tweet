import { useUiStore } from "@/store/slices/ui.slice";

export const uiActions = {
  setActiveChatId: (chatId: string | null) => {
    useUiStore.getState().setActiveChatId(chatId);
  },

  setSidebarOpen: (open: boolean) => {
    useUiStore.getState().setSidebarOpen(open);
  },

  toggleSidebar: () => {
    useUiStore.getState().toggleSidebar();
  },

  getState: () => useUiStore.getState(),
};
