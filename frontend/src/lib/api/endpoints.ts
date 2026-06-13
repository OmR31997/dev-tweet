/**
 * DevTweetHub REST endpoint map (NestJS backend, no global prefix).
 *
 * Browser requests hit `/api/<path>` on the Next.js origin and are proxied to
 * the backend (`http://localhost:4000/<path>`) — see `next.config.ts`.
 */
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },

  users: {
    me: "/users/me",
    list: "/users",
    byId: (id: string) => `/users/${id}`,
    follow: (id: string) => `/users/${id}/follow`,
  },

  posts: {
    list: "/posts",
    create: "/posts",
    like: (id: string) => `/posts/${id}/like`,
    repost: (id: string) => `/posts/${id}/repost`,
    byId: (id: string) => `/posts/${id}`,
    comments: (id: string) => `/posts/${id}/comments`,
  },

  comments: {
    byId: (id: string) => `/comments/${id}`,
    like: (id: string) => `/comments/${id}/like`,
  },

  messages: {
    send: "/messages",
    conversation: (otherUserId: string) => `/messages/${otherUserId}`,
    read: (otherUserId: string) => `/messages/${otherUserId}/read`,
    clear: (otherUserId: string) => `/messages/${otherUserId}/clear`,
    deleteItem: (id: string) => `/messages/item/${id}`,
    unreadCount: "/messages/unread/count",
  },

  notifications: {
    all: "/notifications",
    markRead: (id: string) => `/notifications/${id}/read`,
    clear: "/notifications/clear",
  },

  uploads: {
    image: "/uploads/image",
    imageById: (id: string) => `/uploads/image/${id}`,
  },
} as const;
