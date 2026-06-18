import type { QueryClient } from "@tanstack/react-query";
import type { Message } from "./types";
import { queryKeys } from "./query-keys";

function isMessage(value: unknown): value is Message {
  return (
    typeof value === "object" &&
    value !== null &&
    "senderId" in value &&
    "createdAt" in value &&
    "messageType" in value
  );
}

export function isMessageList(data: unknown): data is Message[] {
  return Array.isArray(data) && (data.length === 0 || isMessage(data[0]));
}

export function toggleReactionOnMessage(
  message: Message,
  userId: string,
  emoji: string,
): Message {
  const reactions = [...(message.reactions ?? [])];
  const existingIndex = reactions.findIndex((reaction) => reaction.userId === userId);

  if (existingIndex >= 0 && reactions[existingIndex].emoji === emoji) {
    reactions.splice(existingIndex, 1);
  } else if (existingIndex >= 0) {
    reactions[existingIndex] = { userId, emoji };
  } else {
    reactions.push({ userId, emoji });
  }

  return { ...message, reactions };
}

function patchMessageLists(
  data: unknown,
  messageId: string,
  updater: (message: Message) => Message,
): unknown {
  if (!isMessageList(data)) return data;
  return data.map((message) =>
    message.id === messageId ? updater(message) : message,
  );
}

/** Update a message inside DM / group message list caches only. */
export function patchMessageInCaches(
  queryClient: QueryClient,
  messageId: string,
  updater: (message: Message) => Message,
) {
  const patch = (data: unknown) => patchMessageLists(data, messageId, updater);

  queryClient.setQueriesData({ queryKey: queryKeys.messages.all }, patch);
  queryClient.setQueriesData({ queryKey: queryKeys.conversations.all }, patch);
}

export function replaceMessageInCaches(queryClient: QueryClient, updated: Message) {
  patchMessageInCaches(queryClient, updated.id, () => updated);
}

export function snapshotMessageListCaches(queryClient: QueryClient) {
  return [
    ...queryClient.getQueriesData({ queryKey: queryKeys.messages.all }),
    ...queryClient.getQueriesData({ queryKey: queryKeys.conversations.all }),
  ].filter((entry): entry is [readonly unknown[], Message[]] =>
    isMessageList(entry[1]),
  );
}

export function restoreMessageListSnapshots(
  queryClient: QueryClient,
  snapshots: [readonly unknown[], Message[]][] | undefined,
) {
  for (const [key, data] of snapshots ?? []) {
    queryClient.setQueryData(key, data);
  }
}
