"use client";

import { ChatMediaPreview } from "@/components/features/messages/ChatMediaPreview";
import type { Post, PostAttachment } from "@/lib/api";
import {
  formatFileSize,
  resolveChatFileUrl,
  resolveImageUrl,
} from "@/lib/api/normalizers";
import { cn } from "@/lib/utils";
import { useTapOnly } from "@/lib/use-tap-only";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { attachmentKind } from "./post-composer.utils";
import { PostCsvViewer } from "./PostCsvViewer";
import { PostPdfViewer } from "./PostPdfViewer";

function isCsvAttachment(attachment: PostAttachment) {
  const kind = attachmentKind(attachment);
  if (kind !== "spreadsheet") return false;
  const name = attachment.filename.toLowerCase();
  return (
    attachment.mimeType === "text/csv" || name.endsWith(".csv")
  );
}

function PostImageTile({
  id,
  index,
  onOpen,
  embedded,
  compact,
}: {
  id: string;
  index: number;
  onOpen: (index: number) => void;
  embedded?: boolean;
  compact?: boolean;
}) {
  const tap = useTapOnly(() => onOpen(index));

  return (
    <button
      type="button"
      aria-label="View photo"
      className={cn(
        "feed-action-btn block overflow-hidden transition-opacity hover:opacity-95",
        embedded ? "rounded-lg" : "rounded-xl border border-border",
      )}
      onClick={tap.onClick}
      onPointerDown={tap.onPointerDown}
      onPointerUp={tap.onPointerUp}
      onPointerCancel={tap.onPointerCancel}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveImageUrl(id)}
        alt=""
        className={cn(
          "pointer-events-none w-full object-cover",
          compact ? "max-h-48" : "max-h-96",
        )}
        draggable={false}
        decoding="async"
      />
    </button>
  );
}

function PostImageGrid({
  imageIds,
  embedded,
  compact,
}: {
  imageIds: string[];
  embedded?: boolean;
  compact?: boolean;
}) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const previewItem = useMemo(() => {
    if (previewIndex === null) return null;
    const id = imageIds[previewIndex];
    if (!id) return null;
    return {
      src: resolveImageUrl(id),
      filename: `photo-${previewIndex + 1}.jpg`,
      kind: "image" as const,
    };
  }, [imageIds, previewIndex]);

  if (imageIds.length === 0) return null;

  return (
    <>
      <div
        className={cn(
          "grid gap-1.5 overflow-hidden",
          embedded ? "mt-1.5 rounded-lg" : "mt-2 gap-2 rounded-xl",
          imageIds.length === 1 ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        {imageIds.map((id, index) => (
          <PostImageTile
            key={id}
            id={id}
            index={index}
            embedded={embedded}
            compact={compact}
            onOpen={setPreviewIndex}
          />
        ))}
      </div>

      <ChatMediaPreview
        item={previewItem}
        onClose={() => setPreviewIndex(null)}
        onPrev={() =>
          setPreviewIndex((current) =>
            current !== null && current > 0 ? current - 1 : current,
          )
        }
        onNext={() =>
          setPreviewIndex((current) =>
            current !== null && current < imageIds.length - 1
              ? current + 1
              : current,
          )
        }
        hasPrev={previewIndex !== null && previewIndex > 0}
        hasNext={
          previewIndex !== null && previewIndex < imageIds.length - 1
        }
      />
    </>
  );
}

function PostAttachmentCard({
  attachment,
  compact,
  embedded,
}: {
  attachment: PostAttachment;
  compact?: boolean;
  embedded?: boolean;
}) {
  const kind = attachmentKind(attachment);
  const href = resolveChatFileUrl(attachment.fileId);
  const sizeLabel = formatFileSize(attachment.size);

  if (kind === "video") {
    return (
      <div
        className={cn(
          "overflow-hidden rounded-lg bg-black",
          embedded ? "mt-1.5" : "mt-2",
          !embedded && "border border-border",
        )}
      >
        <video
          src={href}
          controls
          playsInline
          preload="metadata"
          className={cn("w-full bg-black", compact ? "max-h-48" : "max-h-96")}
        />
      </div>
    );
  }

  if (kind === "pdf") {
    return (
      <PostPdfViewer
        attachment={attachment}
        compact={compact}
        embedded={embedded}
      />
    );
  }

  if (isCsvAttachment(attachment)) {
    return (
      <PostCsvViewer
        attachment={attachment}
        compact={compact}
        embedded={embedded}
      />
    );
  }

  const Icon =
    kind === "spreadsheet" ? FileSpreadsheet : FileText;
  const typeLabel = kind === "spreadsheet" ? "Spreadsheet" : "Document";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-muted/20 transition-colors hover:bg-muted/35",
        embedded ? "mt-1.5 px-2.5 py-2" : "mt-2 px-4 py-3",
      )}
    >
      <div
        className={cn(
          "grid shrink-0 place-items-center rounded-md bg-primary/10 text-primary",
          embedded ? "size-8" : "size-11",
        )}
      >
        <Icon className={embedded ? "size-4" : "size-5"} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-medium",
            embedded ? "text-xs" : "text-sm",
          )}
        >
          {attachment.filename}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {typeLabel}
          {sizeLabel ? ` · ${sizeLabel}` : ""}
        </p>
      </div>
      <Download className="size-4 shrink-0 text-muted-foreground" />
    </a>
  );
}

function PostAttachmentPreview({
  attachment,
  onRemove,
}: {
  attachment: PostAttachment;
  onRemove?: () => void;
}) {
  const kind = attachmentKind(attachment);
  const href = resolveChatFileUrl(attachment.fileId);

  if (kind === "video") {
    return (
      <div className="relative overflow-hidden rounded-lg border border-border bg-black">
        <video
          src={href}
          controls
          playsInline
          preload="metadata"
          className="h-32 w-full object-cover"
        />
        {onRemove ? (
          <RemoveButton onRemove={onRemove} />
        ) : null}
        <div className="pointer-events-none absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
          Video
        </div>
      </div>
    );
  }

  if (kind === "pdf") {
    return (
      <div className="relative">
        <PostPdfViewer attachment={attachment} compact />
        {onRemove ? (
          <RemoveButton onRemove={onRemove} className="z-10" />
        ) : null}
      </div>
    );
  }

  if (isCsvAttachment(attachment)) {
    return (
      <div className="relative">
        <PostCsvViewer attachment={attachment} compact />
        {onRemove ? (
          <RemoveButton onRemove={onRemove} className="z-10" />
        ) : null}
      </div>
    );
  }

  const Icon =
    kind === "spreadsheet" ? FileSpreadsheet : FileText;

  return (
    <div className="relative flex h-32 items-center gap-3 rounded-lg border border-border bg-muted/30 px-3">
      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{attachment.filename}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(attachment.size)}
        </p>
      </div>
      {onRemove ? <RemoveButton onRemove={onRemove} className="top-1.5" /> : null}
    </div>
  );
}

function RemoveButton({
  onRemove,
  className,
}: {
  onRemove: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className={cn(
        "absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white",
        className,
      )}
      aria-label="Remove attachment"
    >
      ×
    </button>
  );
}

export function PostMedia({
  post,
  compact,
  embedded,
}: {
  post: Pick<Post, "imageIds" | "attachments">;
  compact?: boolean;
  embedded?: boolean;
}) {
  const hasImages = post.imageIds.length > 0;
  const hasAttachments = (post.attachments?.length ?? 0) > 0;
  if (!hasImages && !hasAttachments) return null;

  return (
    <>
      {hasImages ? (
        <PostImageGrid
          imageIds={post.imageIds}
          embedded={embedded}
          compact={compact}
        />
      ) : null}
      <div className={cn(embedded && "min-w-0")}>
        {post.attachments?.map((attachment) => (
          <PostAttachmentCard
            key={attachment.fileId}
            attachment={attachment}
            compact={compact}
            embedded={embedded}
          />
        ))}
      </div>
    </>
  );
}

export function PostComposerMediaPreview({
  imageIds,
  attachments,
  onRemoveImage,
  onRemoveAttachment,
}: {
  imageIds: string[];
  attachments: PostAttachment[];
  onRemoveImage: (id: string) => void;
  onRemoveAttachment: (fileId: string) => void;
}) {
  if (imageIds.length === 0 && attachments.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {imageIds.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {imageIds.map((id) => (
            <div key={id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(id)}
                alt=""
                className="h-32 w-full rounded-lg border border-border object-cover"
              />
              <RemoveButton onRemove={() => onRemoveImage(id)} />
            </div>
          ))}
        </div>
      ) : null}

      {attachments.map((attachment) => (
        <PostAttachmentPreview
          key={attachment.fileId}
          attachment={attachment}
          onRemove={() => onRemoveAttachment(attachment.fileId)}
        />
      ))}
    </div>
  );
}
