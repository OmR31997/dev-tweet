import type {
  AuthUser,
  Comment,
  CreateCommentDto,
  CreatePostDto,
  Message,
  Post,
  SendGroupMessageDto,
  SendMessageDto,
} from "./types";

export const OPTIMISTIC_PREFIX = "optimistic:";

export function createOptimisticId() {
  return `${OPTIMISTIC_PREFIX}${crypto.randomUUID()}`;
}

export function isOptimisticId(id: string) {
  return id.startsWith(OPTIMISTIC_PREFIX);
}

function replyFields(
  replyToId: string | undefined,
  existingMessages: Message[] | undefined,
): Pick<
  Message,
  "replyToId" | "replyToContent" | "replyToSenderId" | "replyToSenderName"
> {
  if (!replyToId) return {};
  const reply = existingMessages?.find((message) => message.id === replyToId);
  if (!reply) return { replyToId };
  return {
    replyToId,
    replyToContent: reply.content,
    replyToSenderId: reply.senderId,
    replyToSenderName: reply.replyToSenderName,
  };
}

export function buildOptimisticDmMessage(
  dto: SendMessageDto,
  me: AuthUser,
  existingMessages?: Message[],
): Message {
  const now = new Date().toISOString();
  return {
    id: createOptimisticId(),
    senderId: me.id,
    recipientId: dto.recipientId,
    content: dto.content ?? "",
    delivered: false,
    read: false,
    messageType: dto.messageType ?? "text",
    attachmentId: dto.attachment?.fileId,
    attachmentMimeType: dto.attachment?.mimeType,
    attachmentFilename: dto.attachment?.filename,
    attachmentSize: dto.attachment?.size,
    createdAt: now,
    ...replyFields(dto.replyToId, existingMessages),
  };
}

export function buildOptimisticGroupMessage(
  dto: SendGroupMessageDto,
  conversationId: string,
  me: AuthUser,
  existingMessages?: Message[],
): Message {
  const now = new Date().toISOString();
  return {
    id: createOptimisticId(),
    senderId: me.id,
    conversationId,
    content: dto.content ?? "",
    delivered: false,
    read: false,
    readBy: [],
    messageType: dto.messageType ?? "text",
    attachmentId: dto.attachment?.fileId,
    attachmentMimeType: dto.attachment?.mimeType,
    attachmentFilename: dto.attachment?.filename,
    attachmentSize: dto.attachment?.size,
    createdAt: now,
    ...replyFields(dto.replyToId, existingMessages),
  };
}

export function buildOptimisticComment(
  postId: string,
  dto: CreateCommentDto,
  me: AuthUser,
): Comment {
  return {
    id: createOptimisticId(),
    postId,
    authorId: me.id,
    authorName: me.displayName,
    authorPhoto: me.photoURL,
    content: dto.content,
    likes: [],
    parentId: dto.parentId,
    createdAt: new Date().toISOString(),
  };
}

export function buildOptimisticPost(dto: CreatePostDto, me: AuthUser): Post {
  return {
    id: createOptimisticId(),
    authorId: me.id,
    authorName: me.displayName,
    authorPhoto: me.photoURL,
    content: dto.content,
    imageIds: dto.imageIds ?? [],
    attachments: dto.attachments ?? [],
    likes: [],
    commentCount: 0,
    tags: dto.tags ?? [],
    reposts: [],
    createdAt: new Date().toISOString(),
  };
}

export function replaceOptimisticMessages(
  messages: Message[],
  optimisticIds: string[],
  serverMessages: Message[],
): Message[] {
  const replacements = new Map<string, Message>();
  for (let index = 0; index < optimisticIds.length; index++) {
    const serverMessage = serverMessages[index];
    if (serverMessage) {
      replacements.set(optimisticIds[index], serverMessage);
    }
  }

  const seenServerIds = new Set<string>();
  const next: Message[] = [];

  for (const message of messages) {
    const replacement = replacements.get(message.id);
    if (replacement) {
      if (!seenServerIds.has(replacement.id)) {
        next.push(replacement);
        seenServerIds.add(replacement.id);
      }
      continue;
    }
    if (isOptimisticId(message.id)) continue;
    if (seenServerIds.has(message.id)) continue;
    next.push(message);
    seenServerIds.add(message.id);
  }

  for (const serverMessage of serverMessages) {
    if (!seenServerIds.has(serverMessage.id)) {
      next.push(serverMessage);
      seenServerIds.add(serverMessage.id);
    }
  }

  return next;
}
