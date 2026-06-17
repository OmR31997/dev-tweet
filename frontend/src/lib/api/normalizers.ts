/**
 * Normalizers — map the NestJS backend payloads (`_id`, nested `data`) onto the
 * camelCase domain types. The backend already returns clean JSON, so these are
 * thin and mostly handle the `_id` → `id` rename and array defaults.
 */
import { getClientApiBaseUrl } from "@/config/env";
import type {
  AppNotification,
  ArchivedChatCount,
  AuthResponse,
  AuthUser,
  Comment,
  Conversation,
  DmChat,
  Message,
  NotificationType,
  Post,
  PostAttachment,
} from "./types";

type Raw = Record<string, unknown>;

function asString(value: unknown): string | undefined {
  return value === undefined || value === null ? undefined : String(value);
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)) : [];
}

function idOf(raw: Raw): string {
  return String(raw.id ?? raw._id ?? "");
}

/** Unwrap an optional `{ data: ... }` envelope. */
function unwrap(payload: unknown): Raw {
  const data = (payload ?? {}) as Raw;
  return data.data && typeof data.data === "object"
    ? (data.data as Raw)
    : data;
}

/**
 * Resolve a backend image reference to a browser-loadable URL through the proxy.
 * Accepts a bare upload id, a backend-relative `/uploads/image/<id>` path, or an
 * absolute URL (returned unchanged).
 */
export function resolveImageUrl(idOrUrl?: string | null): string {
  if (!idOrUrl) return "";
  const value = String(idOrUrl);
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }
  const base = getClientApiBaseUrl();
  if (value.startsWith("/uploads/")) {
    return `${base}${value}`;
  }
  // Bare upload id.
  return `${base}/uploads/image/${value}`;
}

export function resolveChatFileUrl(idOrUrl?: string | null): string {
  if (!idOrUrl) return "";
  const value = String(idOrUrl);
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) {
    return value;
  }
  const base = getClientApiBaseUrl();
  if (value.startsWith("/uploads/")) {
    return `${base}${value}`;
  }
  return `${base}/uploads/file/${value}`;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function normalizeUser(payload: unknown): AuthUser {
  const raw = unwrap(payload);
  return {
    id: idOf(raw),
    email: asString(raw.email) ?? "",
    displayName: asString(raw.displayName) ?? asString(raw.email) ?? "",
    photoURL: asString(raw.photoURL),
    bio: asString(raw.bio),
    college: asString(raw.college),
    branch: asString(raw.branch),
    year: asString(raw.year),
    githubUsername: asString(raw.githubUsername),
    followers: asStringArray(raw.followers),
    following: asStringArray(raw.following),
    emailNotificationsEnabled:
      typeof raw.emailNotificationsEnabled === "boolean"
        ? raw.emailNotificationsEnabled
        : undefined,
    dailyDigestEnabled:
      typeof raw.dailyDigestEnabled === "boolean"
        ? raw.dailyDigestEnabled
        : undefined,
    lastSeenAt: asString(raw.lastSeenAt),
    createdAt: asString(raw.createdAt),
    updatedAt: asString(raw.updatedAt),
  };
}

export function normalizeUsers(payload: unknown): AuthUser[] {
  const list = Array.isArray(payload) ? payload : unwrap(payload).users;
  return (Array.isArray(list) ? list : []).map(normalizeUser);
}

export function normalizeAuthResponse(payload: unknown): AuthResponse {
  const raw = unwrap(payload);
  const accessToken = asString(raw.accessToken);
  if (!accessToken) {
    throw new Error("Invalid auth response: missing access token");
  }
  if (!raw.user || typeof raw.user !== "object") {
    throw new Error("Invalid auth response: missing user");
  }
  return {
    accessToken,
    refreshToken: asString(raw.refreshToken),
    user: normalizeUser(raw.user),
  };
}

function normalizePostAttachments(value: unknown): PostAttachment[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const raw = item as Raw;
      const fileId = asString(raw.fileId);
      const mimeType = asString(raw.mimeType);
      const filename = asString(raw.filename);
      const size = Number(raw.size ?? 0);
      if (!fileId || !mimeType || !filename) return null;
      return { fileId, mimeType, filename, size };
    })
    .filter((item): item is PostAttachment => Boolean(item));
}

export function normalizePost(payload: unknown): Post {
  const raw = unwrap(payload);
  return {
    id: idOf(raw),
    authorId: asString(raw.authorId) ?? "",
    authorName: asString(raw.authorName) ?? "",
    authorPhoto: asString(raw.authorPhoto),
    content: asString(raw.content) ?? "",
    imageIds: asStringArray(raw.imageIds),
    attachments: normalizePostAttachments(raw.attachments),
    likes: asStringArray(raw.likes),
    commentCount: Number(raw.commentCount ?? 0),
    tags: asStringArray(raw.tags),
    reposts: asStringArray(raw.reposts),
    repostOf: asString(raw.repostOf),
    repostedById: asString(raw.repostedById),
    repostedByName: asString(raw.repostedByName),
    repostedByPhoto: asString(raw.repostedByPhoto),
    repostCaption: asString(raw.repostCaption),
    createdAt: asString(raw.createdAt) ?? "",
    updatedAt: asString(raw.updatedAt),
  };
}

export function normalizePosts(payload: unknown): Post[] {
  const list = Array.isArray(payload) ? payload : unwrap(payload).posts;
  return (Array.isArray(list) ? list : []).map(normalizePost);
}

export function normalizeComment(payload: unknown): Comment {
  const raw = unwrap(payload);
  return {
    id: idOf(raw),
    postId: asString(raw.postId) ?? "",
    authorId: asString(raw.authorId) ?? "",
    authorName: asString(raw.authorName) ?? "",
    authorPhoto: asString(raw.authorPhoto),
    content: asString(raw.content) ?? "",
    likes: asStringArray(raw.likes),
    parentId: asString(raw.parentId),
    createdAt: asString(raw.createdAt) ?? "",
  };
}

export function normalizeComments(payload: unknown): Comment[] {
  const list = Array.isArray(payload) ? payload : unwrap(payload).comments;
  return (Array.isArray(list) ? list : []).map(normalizeComment);
}

export function normalizeMessage(payload: unknown): Message {
  const raw = unwrap(payload);
  return {
    id: idOf(raw),
    senderId: asString(raw.senderId) ?? "",
    recipientId: asString(raw.recipientId),
    conversationId: asString(raw.conversationId),
    content: asString(raw.content) ?? "",
    delivered: Boolean(raw.delivered),
    read: Boolean(raw.read),
    readBy: asStringArray(raw.readBy),
    reactions: Array.isArray(raw.reactions)
      ? raw.reactions.map((r) => {
          const reaction = r as Raw;
          return {
            userId: asString(reaction.userId) ?? "",
            emoji: asString(reaction.emoji) ?? "",
          };
        })
      : [],
    isForwarded: Boolean(raw.isForwarded),
    messageType: (asString(raw.messageType) ?? "text") as Message["messageType"],
    attachmentId: asString(raw.attachmentId),
    attachmentMimeType: asString(raw.attachmentMimeType),
    attachmentFilename: asString(raw.attachmentFilename),
    attachmentSize: Number(raw.attachmentSize ?? 0) || undefined,
    replyToId: asString(raw.replyToId),
    replyToContent: asString(raw.replyToContent),
    replyToSenderId: asString(raw.replyToSenderId),
    replyToSenderName: asString(raw.replyToSenderName),
    createdAt: asString(raw.createdAt) ?? "",
  };
}

export function normalizeMessages(payload: unknown): Message[] {
  const list = Array.isArray(payload) ? payload : unwrap(payload).messages;
  const messages = (Array.isArray(list) ? list : []).map(normalizeMessage);
  return messages.sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
  );
}

export function normalizeConversation(payload: unknown): Conversation {
  const raw = unwrap(payload);
  return {
    id: idOf(raw),
    type: (asString(raw.type) ?? "group") as Conversation["type"],
    title: asString(raw.title) ?? "",
    description: asString(raw.description) ?? "",
    participants: asStringArray(raw.participants),
    admins: asStringArray(raw.admins),
    createdBy: asString(raw.createdBy) ?? "",
    createdAt: asString(raw.createdAt) ?? "",
    updatedAt: asString(raw.updatedAt),
    isArchived: Boolean(raw.isArchived),
  };
}

export function normalizeConversations(payload: unknown): Conversation[] {
  const list = Array.isArray(payload)
    ? payload
    : unwrap(payload).conversations;
  return (Array.isArray(list) ? list : []).map(normalizeConversation);
}

export function normalizeDmChat(payload: unknown): DmChat {
  const raw = unwrap(payload);
  return {
    peerUserId: asString(raw.peerUserId) ?? "",
    displayName: asString(raw.displayName) ?? "User",
    photoURL: asString(raw.photoURL),
    branch: asString(raw.branch),
    lastMessage: asString(raw.lastMessage) ?? "",
    lastMessageAt: asString(raw.lastMessageAt) ?? "",
    isArchived: Boolean(raw.isArchived),
  };
}

export function normalizeDmChats(payload: unknown): DmChat[] {
  const list = Array.isArray(payload) ? payload : unwrap(payload).chats;
  return (Array.isArray(list) ? list : []).map(normalizeDmChat);
}

export function normalizeArchivedCount(payload: unknown): ArchivedChatCount {
  const raw = unwrap(payload);
  return {
    groups: Number(raw.groups ?? 0),
    dms: Number(raw.dms ?? 0),
    total: Number(raw.total ?? 0),
  };
}

export function normalizeNotification(payload: unknown): AppNotification {
  const raw = unwrap(payload);
  return {
    id: idOf(raw),
    recipientId: asString(raw.recipientId) ?? "",
    senderId: asString(raw.senderId) ?? "",
    senderName: asString(raw.senderName) ?? "",
    type: (asString(raw.type) ?? "post") as NotificationType,
    postId: asString(raw.postId),
    read: Boolean(raw.read),
    createdAt: asString(raw.createdAt) ?? "",
  };
}

export function normalizeNotifications(payload: unknown): AppNotification[] {
  const list = Array.isArray(payload)
    ? payload
    : unwrap(payload).notifications;
  return (Array.isArray(list) ? list : []).map(normalizeNotification);
}
