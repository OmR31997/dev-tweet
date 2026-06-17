"use client";

import { Button } from "@/components/ui/button";
import type { MessageAttachmentPayload, ReplyTarget } from "@/lib/api";
import { useUploadChatFile } from "@/lib/api";
import { formatFileSize } from "@/lib/api/normalizers";
import { cn } from "@/lib/utils";
import { FileText, Paperclip, Send, Smile, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmojiReactionPanel } from "./EmojiReactionPanel";
import { ReplyPreview } from "./ReplyPreview";

const ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf";
const MAX_ATTACHMENTS = 10;

export type ComposerSendPayload = {
  content: string;
  messageType: "text" | "image" | "document";
  attachment?: MessageAttachmentPayload;
  attachments?: MessageAttachmentPayload[];
};

type PendingAttachment = MessageAttachmentPayload & {
  messageType: "image" | "document";
  previewUrl?: string;
  localKey: string;
};

export function MessageComposer({
  value,
  onChange,
  onSend,
  onTyping,
  disabled,
  placeholder = "Type a message…",
  replyTo,
  onCancelReply,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: (payload: ComposerSendPayload) => void;
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
  replyTo?: ReplyTarget | null;
  onCancelReply?: () => void;
}) {
  const uploadFile = useUploadChatFile();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emojiPos, setEmojiPos] = useState<React.CSSProperties>({});
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const smileRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [value]);

  const openEmojiPicker = () => {
    if (emojiOpen) {
      setEmojiOpen(false);
      return;
    }
    const rect = smileRef.current?.getBoundingClientRect();
    if (rect) {
      const panelWidth = 320;
      setEmojiPos({
        bottom: window.innerHeight - rect.top + 8,
        left: Math.max(
          8,
          Math.min(rect.left, window.innerWidth - panelWidth - 8),
        ),
      });
    }
    setEmojiOpen(true);
  };

  const revokePreview = (item: PendingAttachment) => {
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
  };

  const clearAttachments = () => {
    for (const item of attachments) revokePreview(item);
    setAttachments([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeAttachment = (localKey: string) => {
    setAttachments((prev) => {
      const target = prev.find((item) => item.localKey === localKey);
      if (target) revokePreview(target);
      return prev.filter((item) => item.localKey !== localKey);
    });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const images = files.filter((file) => file.type.startsWith("image/"));
    const documents = files.filter((file) => !file.type.startsWith("image/"));

    if (documents.length > 0 && images.length > 0) {
      return;
    }

    if (documents.length > 0) {
      const file = documents[0];
      setUploadingCount((count) => count + 1);
      try {
        const uploaded = await uploadFile.mutateAsync(file);
        clearAttachments();
        setAttachments([
          {
            localKey: `${uploaded.fileId}-${Date.now()}`,
            fileId: uploaded.fileId,
            mimeType: uploaded.mimeType,
            filename: uploaded.filename,
            size: uploaded.size,
            messageType: "document",
          },
        ]);
      } catch {
        clearAttachments();
      } finally {
        setUploadingCount((count) => Math.max(0, count - 1));
      }
      return;
    }

    const remaining = MAX_ATTACHMENTS - attachments.length;
    const toUpload = images.slice(0, Math.max(0, remaining));
    if (!toUpload.length) return;

    setUploadingCount((count) => count + toUpload.length);
    const uploadedItems: PendingAttachment[] = [];

    await Promise.all(
      toUpload.map(async (file) => {
        try {
          const uploaded = await uploadFile.mutateAsync(file);
          uploadedItems.push({
            localKey: `${uploaded.fileId}-${file.name}-${Math.random()}`,
            fileId: uploaded.fileId,
            mimeType: uploaded.mimeType,
            filename: uploaded.filename,
            size: uploaded.size,
            messageType: "image",
            previewUrl: URL.createObjectURL(file),
          });
        } catch {
          // skip failed uploads
        } finally {
          setUploadingCount((count) => Math.max(0, count - 1));
        }
      }),
    );

    if (uploadedItems.length > 0) {
      setAttachments((prev) => {
        const onlyImages = prev.filter((item) => item.messageType === "image");
        for (const item of prev.filter((item) => item.messageType === "document")) {
          revokePreview(item);
        }
        return [...onlyImages, ...uploadedItems].slice(0, MAX_ATTACHMENTS);
      });
    }
  };

  const hasAttachments = attachments.length > 0;
  const allImages =
    hasAttachments && attachments.every((item) => item.messageType === "image");
  const canSend = hasAttachments || Boolean(value.trim());
  const busy = disabled || uploadingCount > 0 || uploadFile.isPending;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend || busy) return;

    if (attachments.length > 1) {
      onSend({
        content: value.trim(),
        messageType: "image",
        attachments: attachments.map(
          ({ fileId, mimeType, filename, size }) => ({
            fileId,
            mimeType,
            filename,
            size,
          }),
        ),
      });
    } else if (attachments.length === 1) {
      const attachment = attachments[0];
      onSend({
        content: value.trim(),
        messageType: attachment.messageType,
        attachment: {
          fileId: attachment.fileId,
          mimeType: attachment.mimeType,
          filename: attachment.filename,
          size: attachment.size,
        },
      });
    } else {
      onSend({
        content: value.replace(/^\s+|\s+$/g, ""),
        messageType: "text",
      });
    }
    clearAttachments();
  };

  return (
    <div className="border-t border-border bg-card">
      {replyTo ? (
        <ReplyPreview reply={replyTo} onCancel={() => onCancelReply?.()} />
      ) : null}

      {hasAttachments ? (
        <div className="border-b border-border px-4 py-2.5">
          {attachments.length === 1 && attachments[0].messageType === "document" ? (
            <div className="flex items-center gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-muted">
                <FileText className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {attachments[0].filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachments[0].size)}
                </p>
              </div>
              <button
                type="button"
                onClick={clearAttachments}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent"
                aria-label="Remove attachment"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
                {attachments.map((item) => (
                  <div key={item.localKey} className="relative shrink-0">
                    {item.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.previewUrl}
                        alt={item.filename}
                        className="size-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="grid size-16 place-items-center rounded-lg bg-muted">
                        <FileText className="size-5 text-muted-foreground" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(item.localKey)}
                      className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-foreground text-background shadow"
                      aria-label="Remove image"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                {uploadingCount > 0 ? (
                  <div className="grid size-16 shrink-0 place-items-center rounded-lg bg-muted text-xs text-muted-foreground">
                    …
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={clearAttachments}
                className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
          )}
          {allImages && attachments.length > 1 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {attachments.length} photos selected
            </p>
          ) : null}
        </div>
      ) : null}

      <form
        onSubmit={submit}
        className="relative flex items-end gap-2 px-4 py-3"
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={onFileChange}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 shrink-0"
          onClick={() => fileRef.current?.click()}
          disabled={busy || attachments.length >= MAX_ATTACHMENTS}
          aria-label="Attach file"
        >
          <Paperclip className="size-5" />
        </Button>

        <div className="relative" ref={smileRef}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0"
            onClick={openEmojiPicker}
            aria-label="Open emoji picker"
          >
            <Smile className="size-5" />
          </Button>
          <EmojiReactionPanel
            open={emojiOpen}
            onClose={() => setEmojiOpen(false)}
            onPick={(emoji) => onChange(value + emoji)}
            style={emojiPos}
            growUpward
          />
        </div>

        <textarea
          ref={inputRef}
          value={value}
          rows={1}
          onChange={(e) => {
            onChange(e.target.value);
            onTyping?.();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={
            hasAttachments
              ? allImages
                ? attachments.length > 1
                  ? "Add a caption…"
                  : "Add a caption…"
                : "Add a message…"
              : placeholder
          }
          className={cn(
            "chat-composer-textarea border-input bg-background flex min-h-10 w-full min-w-0 flex-1 rounded-md border px-3 py-2 text-sm shadow-xs outline-none",
            "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          )}
        />
        <Button
          type="submit"
          size="icon"
          className={cn("size-10 shrink-0")}
          disabled={!canSend || busy}
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
