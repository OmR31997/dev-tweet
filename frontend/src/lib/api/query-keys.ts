export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (q?: string) => [...queryKeys.users.all, "list", q ?? ""] as const,
    detail: (id: string) => [...queryKeys.users.all, id] as const,
  },
  posts: {
    all: ["posts"] as const,
    feed: (q?: string) => [...queryKeys.posts.all, "feed", q ?? ""] as const,
  },
  comments: {
    all: ["comments"] as const,
    forPost: (postId: string) => [...queryKeys.comments.all, postId] as const,
  },
  messages: {
    all: ["messages"] as const,
    conversation: (otherUserId: string) =>
      [...queryKeys.messages.all, otherUserId] as const,
    unreadCount: () => [...queryKeys.messages.all, "unread-count"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: () => [...queryKeys.notifications.all, "list"] as const,
  },
} as const;
