/**
 * DevTweetHub domain types — mirrors the NestJS backend
 * (auth, users, posts, messages, notifications, uploads).
 */

// ── Users / auth ──────────────────────────────────────────────────────────

/** Domain user model (camelCase). `id` is mapped from the backend `_id`. */
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  college?: string;
  branch?: string;
  year?: string;
  githubUsername?: string;
  followers?: string[];
  following?: string[];
  emailNotificationsEnabled?: boolean;
  dailyDigestEnabled?: boolean;
  lastSeenAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPresence {
  userId: string;
  online: boolean;
  lastSeenAt: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/** POST /auth/login | /auth/register | /auth/refresh response. */
export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  displayName: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

/** PATCH /users/me — partial profile update. */
export interface UpdateProfileDto {
  displayName?: string;
  photoURL?: string;
  bio?: string;
  college?: string;
  branch?: string;
  year?: string;
  githubUsername?: string;
  emailNotificationsEnabled?: boolean;
  dailyDigestEnabled?: boolean;
}

// ── Posts ─────────────────────────────────────────────────────────────────

export interface PostAttachment {
  fileId: string;
  mimeType: string;
  filename: string;
  size: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  imageIds: string[];
  attachments: PostAttachment[];
  likes: string[];
  commentCount: number;
  tags: string[];
  reposts: string[];
  repostOf?: string;
  repostedById?: string;
  repostedByName?: string;
  repostedByPhoto?: string;
  repostCaption?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePostDto {
  content: string;
  imageIds?: string[];
  attachments?: PostAttachment[];
  tags?: string[];
}

export interface UpdatePostDto {
  content?: string;
  imageIds?: string[];
  attachments?: PostAttachment[];
  tags?: string[];
}

export interface RepostPostDto {
  caption?: string;
}

// ── Comments ────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  likes: string[];
  parentId?: string;
  createdAt: string;
}

export interface CreateCommentDto {
  content: string;
  parentId?: string;
}

// ── Direct messages ─────────────────────────────────────────────────────────

export interface MessageReaction {
  userId: string;
  emoji: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId?: string;
  conversationId?: string;
  content: string;
  delivered?: boolean;
  read: boolean;
  readBy?: string[];
  reactions?: MessageReaction[];
  isForwarded?: boolean;
  messageType?: "text" | "system" | "image" | "document";
  attachmentId?: string;
  attachmentMimeType?: string;
  attachmentFilename?: string;
  attachmentSize?: number;
  replyToId?: string;
  replyToContent?: string;
  replyToSenderId?: string;
  replyToSenderName?: string;
  createdAt: string;
}

export interface MessageAttachmentPayload {
  fileId: string;
  mimeType: string;
  filename: string;
  size: number;
}

export interface SendMessageDto {
  recipientId: string;
  content?: string;
  messageType?: "text" | "image" | "document";
  attachment?: MessageAttachmentPayload;
  replyToId?: string;
}

export interface ForwardMessagesDto {
  messageIds: string[];
  recipientId?: string;
  conversationId?: string;
}

export interface Conversation {
  id: string;
  type: "dm" | "group";
  title: string;
  description: string;
  participants: string[];
  admins: string[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  isArchived?: boolean;
}

export interface DmChat {
  peerUserId: string;
  displayName: string;
  photoURL?: string;
  branch?: string;
  lastMessage: string;
  lastMessageAt: string;
  isArchived?: boolean;
}

export interface ArchivedChatCount {
  groups: number;
  dms: number;
  total: number;
}

export interface CreateGroupDto {
  title: string;
  description?: string;
  participantIds: string[];
}

export interface UpdateGroupDto {
  title?: string;
  description?: string;
}

export interface ReplyTarget {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
}

export interface SendGroupMessageDto {
  content?: string;
  messageType?: "text" | "image" | "document";
  attachment?: MessageAttachmentPayload;
  replyToId?: string;
}

// ── Notifications ───────────────────────────────────────────────────────────

export type NotificationType =
  | "like"
  | "comment"
  | "follow"
  | "unfollow"
  | "follow_accept"
  | "message"
  | "post"
  | "repost";

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  type: NotificationType;
  postId?: string;
  read: boolean;
  createdAt: string;
}

// ── Uploads ─────────────────────────────────────────────────────────────────

export interface UploadResult {
  id: string;
  url: string;
  filename: string;
}
