import type { ComposerSendPayload } from "@/components/features/messages/MessageComposer";
import type { SendGroupMessageDto, SendMessageDto } from "@/lib/api";

type SendDto = SendMessageDto | SendGroupMessageDto;

export function buildMessagesFromComposerPayload<T extends SendDto>(
  payload: ComposerSendPayload,
  base: Omit<T, "content" | "messageType" | "attachment" | "replyToId">,
  replyToId?: string,
): T[] {
  if (payload.attachments?.length) {
    return payload.attachments.map((attachment, index) => ({
      ...base,
      content: index === 0 ? payload.content : "",
      messageType: attachment.mimeType.startsWith("image/")
        ? "image"
        : "document",
      attachment,
      replyToId: index === 0 ? replyToId : undefined,
    })) as T[];
  }

  if (payload.attachment) {
    return [
      {
        ...base,
        content: payload.content,
        messageType: payload.messageType,
        attachment: payload.attachment,
        replyToId,
      },
    ] as T[];
  }

  return [
    {
      ...base,
      content: payload.content,
      messageType: "text",
      replyToId,
    },
  ] as T[];
}
