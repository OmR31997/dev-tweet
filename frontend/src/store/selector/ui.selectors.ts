import type { UiStore } from "@/store/types";
import { useUiStore } from "@/store/slices/ui.slice";

export const uiSelectors = {
  activeChatId: (state: UiStore) => state.activeChatId,
  isSidebarOpen: (state: UiStore) => state.isSidebarOpen,
};

export function useActiveChatId() {
  return useUiStore(uiSelectors.activeChatId);
}

export function useIsSidebarOpen() {
  return useUiStore(uiSelectors.isSidebarOpen);
}
