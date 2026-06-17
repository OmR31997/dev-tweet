"use client";

import { formatFileSize } from "@/lib/api/normalizers";
import { Download, FileText, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export type ChatMediaPreviewItem = {
  src: string;
  filename?: string;
  caption?: string;
  size?: number;
  kind: "image" | "document";
};

async function downloadMedia(url: string, filename: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Download failed");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename || "download";
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export function ChatMediaPreview({
  item,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  item: ChatMediaPreviewItem | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!item) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasPrev) onPrev?.();
      if (event.key === "ArrowRight" && hasNext) onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose, onPrev, onNext, hasPrev, hasNext]);

  useEffect(() => {
    if (!item) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [item]);

  const handleDownload = useCallback(async () => {
    if (!item) return;
    setDownloading(true);
    try {
      await downloadMedia(item.src, item.filename || "download");
    } finally {
      setDownloading(false);
    }
  }, [item]);

  if (!item || typeof document === "undefined") return null;

  const title = item.kind === "image" ? "Photo" : "Document";

  return createPortal(
    <div
      className="chat-media-preview-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div className="chat-media-preview-toolbar" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="chat-media-preview-close"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X className="size-5" />
        </button>
        <span className="chat-media-preview-type">{title}</span>
        <span className="chat-media-preview-toolbar-spacer" />
        <button
          type="button"
          className="chat-media-preview-download"
          onClick={handleDownload}
          disabled={downloading}
        >
          <span className="inline-flex items-center gap-2">
            <Download className="size-4" />
            {downloading ? "Downloading…" : "Download"}
          </span>
        </button>
      </div>

      <div
        className="chat-media-preview-stage"
        onClick={(e) => e.stopPropagation()}
      >
        {item.kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt={item.filename || "Photo"}
            className="chat-media-preview-image"
          />
        ) : (
          <div className="chat-media-preview-file-card">
            <div className="chat-media-preview-file-icon-wrap">
              <FileText className="size-8 text-white" />
            </div>
            <p className="chat-media-preview-file-title">
              {item.filename || "Document"}
            </p>
            {item.size ? (
              <p className="chat-media-preview-file-meta">
                {formatFileSize(item.size)}
              </p>
            ) : null}
          </div>
        )}
      </div>

      {item.caption?.trim() ? (
        <p className="chat-media-preview-caption">{item.caption}</p>
      ) : null}

      {hasPrev ? (
        <button
          type="button"
          className="chat-media-preview-nav chat-media-preview-nav--prev"
          onClick={(e) => {
            e.stopPropagation();
            onPrev?.();
          }}
          aria-label="Previous"
        >
          ‹
        </button>
      ) : null}
      {hasNext ? (
        <button
          type="button"
          className="chat-media-preview-nav chat-media-preview-nav--next"
          onClick={(e) => {
            e.stopPropagation();
            onNext?.();
          }}
          aria-label="Next"
        >
          ›
        </button>
      ) : null}
    </div>,
    document.body,
  );
}
