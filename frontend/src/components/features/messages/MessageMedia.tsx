"use client";

import type { Message } from "@/lib/api";
import { formatFileSize, resolveChatFileUrl } from "@/lib/api/normalizers";
import { cn } from "@/lib/utils";
import { Download, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ChatMediaPreview,
  type ChatMediaPreviewItem,
} from "./ChatMediaPreview";
import { BubbleTextWithMeta } from "./BubbleTextWithMeta";
import { ChatMessageText } from "./ChatMessageText";
import { fileExtension } from "./chat-panel.utils";

function documentBadgeClass(ext: string, mine: boolean): string {
  const tone = ext.toUpperCase();
  if (tone === "PDF") return "chat-doc-badge--pdf";
  if (tone === "XLS" || tone === "XLSX" || tone === "CSV") {
    return "chat-doc-badge--sheet";
  }
  if (tone === "DOC" || tone === "DOCX") return "chat-doc-badge--doc";
  return mine ? "chat-doc-badge--out" : "chat-doc-badge--in";
}

function toPreviewItem(message: Message): ChatMediaPreviewItem | null {
  if (!message.attachmentId) return null;
  const src = resolveChatFileUrl(message.attachmentId);
  if (message.messageType === "image") {
    return {
      src,
      filename: message.attachmentFilename || "photo.jpg",
      caption: message.content,
      kind: "image",
    };
  }
  if (message.messageType === "document") {
    return {
      src,
      filename: message.attachmentFilename || "document",
      caption: message.content,
      size: message.attachmentSize,
      kind: "document",
    };
  }
  return null;
}

export function MessageMedia({
  message,
  mine,
  gallery,
  metaOverlay,
  captionMeta,
  footerMeta,
  metaClass,
}: {
  message: Message;
  mine: boolean;
  gallery?: Message[];
  metaOverlay?: React.ReactNode;
  captionMeta?: React.ReactNode;
  footerMeta?: React.ReactNode;
  metaClass?: string;
}) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const mediaMessages = useMemo(() => {
    return (
      gallery?.filter(
        (item) =>
          item.attachmentId &&
          (item.messageType === "image" || item.messageType === "document"),
      ) ?? (message.attachmentId ? [message] : [])
    );
  }, [gallery, message]);

  const galleryItems = useMemo(
    () =>
      mediaMessages
        .map((item) => toPreviewItem(item))
        .filter((item): item is ChatMediaPreviewItem => Boolean(item)),
    [mediaMessages],
  );

  const openPreview = () => {
    if (!message.attachmentId) return;
    const index = mediaMessages.findIndex((item) => item.id === message.id);
    setPreviewIndex(index >= 0 ? index : 0);
  };

  const previewItem =
    previewIndex !== null ? (galleryItems[previewIndex] ?? null) : null;

  if (message.messageType === "image" && message.attachmentId) {
    const src = resolveChatFileUrl(message.attachmentId);
    return (
      <>
        <div className="min-w-0 leading-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openPreview();
            }}
            className="relative block max-w-full overflow-hidden rounded-[10px] leading-none transition-opacity hover:opacity-95"
            aria-label="View photo"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={message.attachmentFilename || "Image"}
              className="block max-h-72 w-auto max-w-[min(280px,75vw)] cursor-pointer rounded-[10px] object-contain"
            />
            {metaOverlay ? (
              <span
                className={cn(
                  "absolute bottom-1.5 right-1.5 rounded-md bg-black/50 px-1.5 py-0.5 backdrop-blur-[2px]",
                  metaClass,
                )}
              >
                {metaOverlay}
              </span>
            ) : null}
          </button>
          {message.content?.trim() ? (
            captionMeta ? (
              <BubbleTextWithMeta meta={captionMeta}>
                <ChatMessageText content={message.content} mine={mine} />
              </BubbleTextWithMeta>
            ) : (
              <div className="chat-bubble-caption mt-1 px-0.5 pt-1">
                <ChatMessageText content={message.content} mine={mine} />
              </div>
            )
          ) : null}
        </div>

        <ChatMediaPreview
          item={previewItem}
          onClose={() => setPreviewIndex(null)}
          hasPrev={previewIndex !== null && previewIndex > 0}
          hasNext={
            previewIndex !== null && previewIndex < galleryItems.length - 1
          }
          onPrev={() =>
            setPreviewIndex((index) =>
              index !== null && index > 0 ? index - 1 : index,
            )
          }
          onNext={() =>
            setPreviewIndex((index) =>
              index !== null && index < galleryItems.length - 1
                ? index + 1
                : index,
            )
          }
        />
      </>
    );
  }

  if (message.messageType === "document" && message.attachmentId) {
    const ext = fileExtension(
      message.attachmentFilename,
      message.attachmentMimeType,
    );
    const filename = message.attachmentFilename || "Document";

    return (
      <>
        <div className="chat-doc-card-wrap min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openPreview();
            }}
            className={cn(
              "chat-doc-card",
              mine ? "chat-doc-card--out" : "chat-doc-card--in",
            )}
          >
            <span
              className={cn(
                "chat-doc-badge",
                documentBadgeClass(ext, mine),
              )}
            >
              {ext || <FileText className="size-5" />}
            </span>
            <span className="chat-doc-copy min-w-0 flex-1">
              <span className="chat-doc-name">{filename}</span>
              <span
                className={cn(
                  "chat-doc-meta",
                  mine ? "chat-doc-meta--out" : "chat-doc-meta--in",
                )}
              >
                {[ext, formatFileSize(message.attachmentSize)]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </span>
            <span className="chat-doc-download" aria-hidden>
              <Download className="size-4" />
            </span>
          </button>
          {message.content?.trim() ? (
            captionMeta ? (
              <BubbleTextWithMeta meta={captionMeta}>
                <ChatMessageText content={message.content} mine={mine} />
              </BubbleTextWithMeta>
            ) : (
              <div className="chat-bubble-caption mt-1 px-0.5">
                <ChatMessageText content={message.content} mine={mine} />
              </div>
            )
          ) : null}
          {footerMeta ? (
            <div className="chat-doc-time">{footerMeta}</div>
          ) : null}
        </div>

        <ChatMediaPreview
          item={previewItem}
          onClose={() => setPreviewIndex(null)}
          hasPrev={previewIndex !== null && previewIndex > 0}
          hasNext={
            previewIndex !== null && previewIndex < galleryItems.length - 1
          }
          onPrev={() =>
            setPreviewIndex((index) =>
              index !== null && index > 0 ? index - 1 : index,
            )
          }
          onNext={() =>
            setPreviewIndex((index) =>
              index !== null && index < galleryItems.length - 1
                ? index + 1
                : index,
            )
          }
        />
      </>
    );
  }

  return null;
}
