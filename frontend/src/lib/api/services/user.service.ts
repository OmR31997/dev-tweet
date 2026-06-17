import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { normalizeUser, normalizeUsers } from "../normalizers";
import type { AuthUser, UpdateProfileDto, UserPresence } from "../types";

export const userService = {
  /** List or search users (`?q=&limit=`). */
  async list(q?: string, limit = 25): Promise<AuthUser[]> {
    const { data } = await apiClient.get(API_ENDPOINTS.users.list, {
      params: { q: q || undefined, limit },
    });
    return normalizeUsers(data);
  },

  async byId(id: string): Promise<AuthUser> {
    const { data } = await apiClient.get(API_ENDPOINTS.users.byId(id));
    return normalizeUser(data);
  },

  async followers(id: string): Promise<AuthUser[]> {
    const { data } = await apiClient.get(API_ENDPOINTS.users.followers(id));
    return normalizeUsers(data);
  },

  async following(id: string): Promise<AuthUser[]> {
    const { data } = await apiClient.get(API_ENDPOINTS.users.following(id));
    return normalizeUsers(data);
  },

  async presence(id: string): Promise<UserPresence> {
    const { data } = await apiClient.get(API_ENDPOINTS.users.presence(id));
    const raw = (data ?? {}) as Partial<UserPresence>;
    return {
      userId: String(raw.userId ?? id),
      online: Boolean(raw.online),
      lastSeenAt: raw.lastSeenAt ? String(raw.lastSeenAt) : null,
    };
  },

  async presenceBulk(userIds: string[]): Promise<UserPresence[]> {
    const { data } = await apiClient.post(API_ENDPOINTS.users.presenceBulk, {
      userIds,
    });
    const list = Array.isArray(data) ? data : [];
    return list.map((item) => {
      const raw = item as Partial<UserPresence>;
      return {
        userId: String(raw.userId ?? ""),
        online: Boolean(raw.online),
        lastSeenAt: raw.lastSeenAt ? String(raw.lastSeenAt) : null,
      };
    });
  },

  async updateProfile(dto: UpdateProfileDto): Promise<AuthUser> {
    const { data } = await apiClient.patch(API_ENDPOINTS.users.me, dto);
    return normalizeUser(data);
  },

  /** Toggle follow/unfollow. Returns the new following state. */
  async toggleFollow(id: string): Promise<{ following: boolean }> {
    const { data } = await apiClient.post(API_ENDPOINTS.users.follow(id));
    return { following: Boolean((data as { following?: boolean })?.following) };
  },
};
