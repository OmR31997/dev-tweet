import { apiClient } from "../client";
import { API_ENDPOINTS } from "../endpoints";
import type { MessageAttachmentPayload } from "../types";

export interface ChatFileUploadResult extends MessageAttachmentPayload {
  url: string;
}

export const uploadService = {
  async uploadChatFile(file: File): Promise<ChatFileUploadResult> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await apiClient.post(API_ENDPOINTS.uploads.chatFile, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = (data ?? {}) as Partial<ChatFileUploadResult & { id?: string }>;
    return {
      fileId: String(raw.id ?? raw.fileId ?? ""),
      mimeType: String(raw.mimeType ?? file.type),
      filename: String(raw.filename ?? file.name),
      size: Number(raw.size ?? file.size),
      url: String(raw.url ?? ""),
    };
  },
};
