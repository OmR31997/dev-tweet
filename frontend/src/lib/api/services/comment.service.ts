import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { normalizeComment, normalizeComments } from "../normalizers";
import type { Comment, CreateCommentDto } from "../types";

export const commentService = {
  async list(postId: string): Promise<Comment[]> {
    const { data } = await apiClient.get(API_ENDPOINTS.posts.comments(postId));
    return normalizeComments(data);
  },

  async create(postId: string, dto: CreateCommentDto): Promise<Comment> {
    const { data } = await apiClient.post(
      API_ENDPOINTS.posts.comments(postId),
      dto
    );
    return normalizeComment(data);
  },

  async toggleLike(id: string): Promise<{ liked: boolean }> {
    const { data } = await apiClient.post(API_ENDPOINTS.comments.like(id));
    return { liked: Boolean((data as { liked?: boolean })?.liked) };
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.comments.byId(id));
  },
};
