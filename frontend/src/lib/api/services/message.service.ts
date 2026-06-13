import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { normalizeMessage, normalizeMessages } from "../normalizers";
import type { Message, SendMessageDto } from "../types";

export const messageService = {
  /** Full conversation with another user (oldest → newest). */
  async conversation(otherUserId: string): Promise<Message[]> {
    const { data } = await apiClient.get(
      API_ENDPOINTS.messages.conversation(otherUserId)
    );
    return normalizeMessages(data);
  },

  async send(dto: SendMessageDto): Promise<Message> {
    const { data } = await apiClient.post(API_ENDPOINTS.messages.send, dto);
    return normalizeMessage(data);
  },

  async markRead(otherUserId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.messages.read(otherUserId));
  },

  async clear(otherUserId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.messages.clear(otherUserId));
  },

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.messages.deleteItem(id));
  },

  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get(API_ENDPOINTS.messages.unreadCount);
    return Number((data as { count?: number })?.count ?? 0);
  },
};
