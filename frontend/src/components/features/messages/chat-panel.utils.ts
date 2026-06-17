import type { Message } from "@/lib/api";
import { formatFileSize } from "@/lib/api/normalizers";

const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/gi;

export type ChatMediaItem = Message & { messageType: "image" };

export type ChatFileItem = Message & { messageType: "document" };

export type ChatLinkItem = {
  id: string;
  url: string;
  messageId: string;
  createdAt: string;
};

export function extractChatMedia(messages: Message[]): ChatMediaItem[] {
  return messages.filter(
    (m): m is ChatMediaItem =>
      m.messageType === "image" && Boolean(m.attachmentId),
  );
}

export function extractChatFiles(messages: Message[]): ChatFileItem[] {
  return messages.filter(
    (m): m is ChatFileItem =>
      m.messageType === "document" && Boolean(m.attachmentId),
  );
}

export function extractChatLinks(messages: Message[]): ChatLinkItem[] {
  const links: ChatLinkItem[] = [];
  const seen = new Set<string>();

  for (const message of messages) {
    if (message.messageType !== "text" || !message.content) continue;
    const matches = message.content.match(URL_REGEX) ?? [];
    for (const url of matches) {
      const key = `${message.id}:${url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({
        id: key,
        url,
        messageId: message.id,
        createdAt: message.createdAt,
      });
    }
  }

  return links.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function fileExtension(filename?: string, mimeType?: string): string {
  if (filename?.includes(".")) {
    return filename.split(".").pop()?.slice(0, 4).toUpperCase() ?? "FILE";
  }
  if (mimeType?.includes("/")) {
    return mimeType.split("/").pop()?.slice(0, 4).toUpperCase() ?? "FILE";
  }
  return "FILE";
}

export type FileGroup = {
  title: string;
  items: ChatFileItem[];
};

export function groupFilesByMonth(files: ChatFileItem[]): FileGroup[] {
  const map = new Map<string, ChatFileItem[]>();

  for (const file of files) {
    const date = new Date(file.createdAt);
    const title = date.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    const bucket = map.get(title) ?? [];
    bucket.push(file);
    map.set(title, bucket);
  }

  return Array.from(map.entries()).map(([title, items]) => ({
    title,
    items: items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  }));
}

export function formatLinkHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function fileMetaLine(message: ChatFileItem): string {
  const parts: string[] = [];
  const ext = fileExtension(
    message.attachmentFilename,
    message.attachmentMimeType,
  );
  if (ext) parts.push(ext);
  const size = formatFileSize(message.attachmentSize);
  if (size) parts.push(size);
  const date = new Date(message.createdAt);
  parts.push(
    `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}, ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`,
  );
  return parts.join(" · ");
}
