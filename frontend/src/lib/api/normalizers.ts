/**
 * Normalizers — map the NestJS backend payloads (`_id`, nested `data`) onto the
 * camelCase domain types. The backend already returns clean JSON, so these are
 * thin and mostly handle the `_id` → `id` rename and array defaults.
 */
import { getClientApiBaseUrl } from "@/config/env";
import type {
  AppNotification,
  AuthResponse,
  AuthUser,
  Comment,
  Message,
  NotificationType,
  Post,
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

export function normalizePost(payload: unknown): Post {
  const raw = unwrap(payload);
  return {
    id: idOf(raw),
    authorId: asString(raw.authorId) ?? "",
    authorName: asString(raw.authorName) ?? "",
    authorPhoto: asString(raw.authorPhoto),
    content: asString(raw.content) ?? "",
    imageIds: asStringArray(raw.imageIds),
    likes: asStringArray(raw.likes),
    commentCount: Number(raw.commentCount ?? 0),
    tags: asStringArray(raw.tags),
    reposts: asStringArray(raw.reposts),
    repostOf: asString(raw.repostOf),
    repostedById: asString(raw.repostedById),
    repostedByName: asString(raw.repostedByName),
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
    recipientId: asString(raw.recipientId) ?? "",
    content: asString(raw.content) ?? "",
    read: Boolean(raw.read),
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
