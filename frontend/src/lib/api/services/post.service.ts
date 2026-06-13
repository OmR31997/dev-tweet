import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import { normalizePost, normalizePosts } from "../normalizers";
import type {
  CreatePostDto,
  Post,
  UpdatePostDto,
  UploadResult,
} from "../types";

export const postService = {
  /** Feed or search (`?q=&limit=`), newest first. */
  async list(q?: string, limit = 50): Promise<Post[]> {
    const { data } = await apiClient.get(API_ENDPOINTS.posts.list, {
      params: { q: q || undefined, limit },
    });
    return normalizePosts(data);
  },

  async create(dto: CreatePostDto): Promise<Post> {
    const { data } = await apiClient.post(API_ENDPOINTS.posts.create, dto);
    return normalizePost(data);
  },

  async update(id: string, dto: UpdatePostDto): Promise<Post> {
    const { data } = await apiClient.patch(API_ENDPOINTS.posts.byId(id), dto);
    return normalizePost(data);
  },

  /** Toggle like. Returns the new liked state. */
  async toggleLike(id: string): Promise<{ liked: boolean }> {
    const { data } = await apiClient.post(API_ENDPOINTS.posts.like(id));
    return { liked: Boolean((data as { liked?: boolean })?.liked) };
  },

  /** Toggle repost. Returns the new reposted state. */
  async toggleRepost(id: string): Promise<{ reposted: boolean }> {
    const { data } = await apiClient.post(API_ENDPOINTS.posts.repost(id));
    return { reposted: Boolean((data as { reposted?: boolean })?.reposted) };
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.posts.byId(id));
  },

  /** Upload an image, returning the GridFS id + url. */
  async uploadImage(file: File): Promise<UploadResult> {
    const form = new FormData();
    form.append("image", file);
    const { data } = await apiClient.post(API_ENDPOINTS.uploads.image, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = (data ?? {}) as Partial<UploadResult>;
    return {
      id: String(raw.id ?? ""),
      url: String(raw.url ?? ""),
      filename: String(raw.filename ?? file.name),
    };
  },
};
