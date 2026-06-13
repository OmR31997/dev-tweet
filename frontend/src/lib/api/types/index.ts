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
  followers?: string[];
  following?: string[];
  emailNotificationsEnabled?: boolean;
  dailyDigestEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  emailNotificationsEnabled?: boolean;
  dailyDigestEnabled?: boolean;
}

// ── Posts ─────────────────────────────────────────────────────────────────

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  content: string;
  imageIds: string[];
  likes: string[];
  commentCount: number;
  tags: string[];
  reposts: string[];
  repostOf?: string;
  repostedById?: string;
  repostedByName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePostDto {
  content: string;
  imageIds?: string[];
  tags?: string[];
}

export interface UpdatePostDto {
  content?: string;
  imageIds?: string[];
  tags?: string[];
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

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface SendMessageDto {
  recipientId: string;
  content: string;
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
