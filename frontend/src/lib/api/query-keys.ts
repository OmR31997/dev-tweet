export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  users: {
    all: ["users"] as const,
    list: (q?: string) => [...queryKeys.users.all, "list", q ?? ""] as const,
    detail: (id: string) => [...queryKeys.users.all, id] as const,
    followers: (id: string) => [...queryKeys.users.all, id, "followers"] as const,
    following: (id: string) => [...queryKeys.users.all, id, "following"] as const,
    presence: (id: string) => [...queryKeys.users.all, id, "presence"] as const,
    presenceBulk: (ids: string[]) =>
      [...queryKeys.users.all, "presence-bulk", [...ids].sort().join(",")] as const,
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
  conversations: {
    all: ["conversations"] as const,
    list: (archived = false) =>
      [...queryKeys.conversations.all, "list", archived ? "archived" : "active"] as const,
    detail: (id: string) => [...queryKeys.conversations.all, id] as const,
    messages: (id: string) =>
      [...queryKeys.conversations.all, id, "messages"] as const,
  },
  inbox: {
    all: ["inbox"] as const,
    dms: (archived = false) =>
      [...queryKeys.inbox.all, "dms", archived ? "archived" : "active"] as const,
    archivedCount: () => [...queryKeys.inbox.all, "archived-count"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: () => [...queryKeys.notifications.all, "list"] as const,
  },
  linkPreview: (url: string) => ["link-preview", url] as const,
} as const;
