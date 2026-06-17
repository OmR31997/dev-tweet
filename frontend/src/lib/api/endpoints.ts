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
    followers: (id: string) => `/users/${id}/followers`,
    following: (id: string) => `/users/${id}/following`,
    presence: (id: string) => `/users/${id}/presence`,
    presenceBulk: "/users/presence",
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
    chats: "/messages/chats",
    archivedCount: "/messages/archived/count",
    archive: (otherUserId: string) => `/messages/${otherUserId}/archive`,
    unarchive: (otherUserId: string) => `/messages/${otherUserId}/unarchive`,
    conversation: (otherUserId: string) => `/messages/${otherUserId}`,
    read: (otherUserId: string) => `/messages/${otherUserId}/read`,
    clear: (otherUserId: string) => `/messages/${otherUserId}/clear`,
    clearForEveryone: (otherUserId: string) =>
      `/messages/${otherUserId}/clear/all`,
    deleteItem: (id: string) => `/messages/item/${id}`,
    deleteItemForMe: (id: string) => `/messages/item/${id}/for-me`,
    deleteItemForEveryone: (id: string) => `/messages/item/${id}/for-everyone`,
    reaction: (id: string) => `/messages/item/${id}/reaction`,
    bulkDelete: "/messages/bulk",
    forward: "/messages/forward",
    unreadCount: "/messages/unread/count",
  },

  conversations: {
    list: "/conversations",
    createGroup: "/conversations/group",
    archive: (id: string) => `/conversations/${id}/archive`,
    unarchive: (id: string) => `/conversations/${id}/unarchive`,
    byId: (id: string) => `/conversations/${id}`,
    messages: (id: string) => `/conversations/${id}/messages`,
    read: (id: string) => `/conversations/${id}/read`,
    clear: (id: string) => `/conversations/${id}/clear`,
    clearForEveryone: (id: string) => `/conversations/${id}/clear/all`,
    promoteAdmin: (id: string, userId: string) =>
      `/conversations/${id}/participants/${userId}/admin`,
    demoteAdmin: (id: string, userId: string) =>
      `/conversations/${id}/participants/${userId}/admin`,
    removeParticipant: (id: string, userId: string) =>
      `/conversations/${id}/participants/${userId}`,
    addParticipant: (id: string, userId: string) =>
      `/conversations/${id}/participants/${userId}`,
  },

  notifications: {
    all: "/notifications",
    markRead: (id: string) => `/notifications/${id}/read`,
    clear: "/notifications/clear",
  },

  uploads: {
    image: "/uploads/image",
    imageById: (id: string) => `/uploads/image/${id}`,
    chatFile: "/uploads/chat-file",
    fileById: (id: string) => `/uploads/file/${id}`,
  },

  linkPreview: (url: string) =>
    `/link-preview?url=${encodeURIComponent(url)}`,
} as const;
