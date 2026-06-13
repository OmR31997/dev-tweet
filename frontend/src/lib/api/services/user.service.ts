import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { normalizeUser, normalizeUsers } from "../normalizers";
import type { AuthUser, UpdateProfileDto } from "../types";

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
