import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { normalizeNotifications } from "../normalizers";
import type { AppNotification } from "../types";

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    const { data } = await apiClient.get(API_ENDPOINTS.notifications.all);
    return normalizeNotifications(data);
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.notifications.markRead(id));
  },

  async clear(): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.notifications.clear);
  },
};
