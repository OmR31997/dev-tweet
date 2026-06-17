import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { LinkPreview } from "../types/link-preview";

export const linkPreviewService = {
  async fetch(url: string): Promise<LinkPreview> {
    const { data } = await apiClient.get<LinkPreview>(
      API_ENDPOINTS.linkPreview(url),
    );
    return data;
  },
};
