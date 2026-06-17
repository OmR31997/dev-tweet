import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import {
  normalizeConversation,
  normalizeConversations,
  normalizeMessage,
  normalizeMessages,
} from "../normalizers";
import type {
  Conversation,
  CreateGroupDto,
  Message,
  SendGroupMessageDto,
  UpdateGroupDto,
} from "../types";

export const conversationService = {
  async list(archived = false): Promise<Conversation[]> {
    const { data } = await apiClient.get(API_ENDPOINTS.conversations.list, {
      params: { archived },
    });
    return normalizeConversations(data);
  },

  async getById(id: string): Promise<Conversation> {
    const { data } = await apiClient.get(API_ENDPOINTS.conversations.byId(id));
    return normalizeConversation(data);
  },

  async createGroup(dto: CreateGroupDto): Promise<Conversation> {
    const { data } = await apiClient.post(
      API_ENDPOINTS.conversations.createGroup,
      dto,
    );
    return normalizeConversation(data);
  },

  async updateGroup(id: string, dto: UpdateGroupDto): Promise<Conversation> {
    const { data } = await apiClient.patch(
      API_ENDPOINTS.conversations.byId(id),
      dto,
    );
    return normalizeConversation(data);
  },

  async messages(id: string): Promise<Message[]> {
    const { data } = await apiClient.get(
      API_ENDPOINTS.conversations.messages(id),
    );
    return normalizeMessages(data);
  },

  async sendMessage(id: string, dto: SendGroupMessageDto): Promise<Message> {
    const { data } = await apiClient.post(
      API_ENDPOINTS.conversations.messages(id),
      dto,
    );
    return normalizeMessage(data);
  },

  async markRead(id: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.conversations.read(id));
  },

  async clear(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.conversations.clear(id));
  },

  async clearForEveryone(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.conversations.clearForEveryone(id));
  },

  async promoteAdmin(id: string, userId: string): Promise<Conversation> {
    const { data } = await apiClient.post(
      API_ENDPOINTS.conversations.promoteAdmin(id, userId),
    );
    return normalizeConversation(data);
  },

  async demoteAdmin(id: string, userId: string): Promise<Conversation> {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.conversations.demoteAdmin(id, userId),
    );
    return normalizeConversation(data);
  },

  async removeParticipant(id: string, userId: string): Promise<Conversation> {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.conversations.removeParticipant(id, userId),
    );
    return normalizeConversation(data);
  },

  async addParticipant(id: string, userId: string): Promise<Conversation> {
    const { data } = await apiClient.post(
      API_ENDPOINTS.conversations.addParticipant(id, userId),
    );
    return normalizeConversation(data);
  },

  async archive(id: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.conversations.archive(id));
  },

  async unarchive(id: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.conversations.unarchive(id));
  },
};
