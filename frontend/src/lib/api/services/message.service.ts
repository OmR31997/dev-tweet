import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { normalizeMessage, normalizeMessages, normalizeDmChats, normalizeArchivedCount } from "../normalizers";
import type { DmChat, ForwardMessagesDto, Message, SendMessageDto, ArchivedChatCount } from "../types";

export const messageService = {
  /** DM threads for inbox / archived lists. */
  async listChats(archived = false): Promise<DmChat[]> {
    const { data } = await apiClient.get(API_ENDPOINTS.messages.chats, {
      params: { archived },
    });
    return normalizeDmChats(data);
  },

  async archivedCount(): Promise<ArchivedChatCount> {
    const { data } = await apiClient.get(API_ENDPOINTS.messages.archivedCount);
    return normalizeArchivedCount(data);
  },

  async archive(otherUserId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.messages.archive(otherUserId));
  },

  async unarchive(otherUserId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.messages.unarchive(otherUserId));
  },

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

  async clearForEveryone(otherUserId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.messages.clearForEveryone(otherUserId));
  },

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.messages.deleteItem(id));
  },

  async toggleReaction(id: string, emoji: string): Promise<Message> {
    const { data } = await apiClient.post(API_ENDPOINTS.messages.reaction(id), {
      emoji,
    });
    return normalizeMessage(data);
  },

  async deleteItemForMe(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.messages.deleteItemForMe(id));
  },

  async deleteItemForEveryone(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.messages.deleteItemForEveryone(id));
  },

  async deleteBulk(
    messageIds: string[],
    forEveryone = true,
  ): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.messages.bulkDelete, {
      data: { messageIds, forEveryone },
    });
  },

  async forward(dto: ForwardMessagesDto): Promise<void> {
    await apiClient.post(API_ENDPOINTS.messages.forward, dto);
  },

  async unreadCount(): Promise<number> {
    const { data } = await apiClient.get(API_ENDPOINTS.messages.unreadCount);
    return Number((data as { count?: number })?.count ?? 0);
  },
};
