"use client";

import type { PostAttachment } from "@/lib/api";
import { fetchFileBlob } from "@/lib/api/fetch-file-blob";
import { formatFileSize, resolveChatFileUrl } from "@/lib/api/normalizers";
import { cn } from "@/lib/utils";
import { Download, FileText, Loader2, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PdfPageCarousel } from "./PdfPageCarousel";

export function postFileDownloadUrl(fileId: string) {
  return `${resolveChatFileUrl(fileId)}?download=1`;
}

export function PostDocumentShell({
  attachment,
  kindLabel,
  icon,
  children,
  compact,
}: {
  attachment: PostAttachment;
  kindLabel: string;
  icon: ReactNode;
  children: ReactNode;
  compact?: boolean;
}) {
  const downloadHref = postFileDownloadUrl(attachment.fileId);
  const sizeLabel = formatFileSize(attachment.size);

  return (
    <div
      className={cn(
        "mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        compact && "text-sm",
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-muted/20 px-4 py-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{attachment.filename}</p>
          <p className="text-xs text-muted-foreground">
            {kindLabel}
            {sizeLabel ? ` · ${sizeLabel}` : ""}
          </p>
        </div>
        <a
          href={downloadHref}
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={`Download ${attachment.filename}`}
        >
          <Download className="size-4" />
        </a>
      </div>
      {children}
    </div>
  );
}

function PdfFullscreenViewer({
  open,
  onClose,
  data,
  filename,
  fileId,
}: {
  open: boolean;
  onClose: () => void;
  data: Uint8Array;
  filename: string;
  fileId: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={filename}
    >
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Close preview"
        >
          <X className="size-5" />
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{filename}</p>
        <a
          href={postFileDownloadUrl(fileId)}
          className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={`Download ${filename}`}
        >
          <Download className="size-4" />
        </a>
      </div>
      <div className="min-h-0 flex-1">
        <PdfPageCarousel data={data} className="h-full" showNav />
      </div>
    </div>,
    document.body,
  );
}

export function PostPdfViewer({
  attachment,
  compact,
}: {
  attachment: PostAttachment;
  compact?: boolean;
}) {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const fileUrl = resolveChatFileUrl(attachment.fileId);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(false);
    setPdfData(null);

    fetchFileBlob(fileUrl)
      .then(async (blob) => {
        if (cancelled) return;
        const buffer = await blob.arrayBuffer();
        setPdfData(new Uint8Array(buffer));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  return (
    <PostDocumentShell
      attachment={attachment}
      kindLabel="PDF document"
      icon={<FileText className="size-5" />}
      compact={compact}
    >
      <div className="bg-muted/30">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading document…
          </div>
        ) : error || !pdfData ? (
          <p className="px-4 py-16 text-center text-sm text-muted-foreground">
            Could not preview this PDF. Use download to open the file.
          </p>
        ) : (
          <>
            <PdfPageCarousel data={pdfData} compact={compact} />
            <div className="border-t border-border px-4 py-3 md:hidden">
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                className="w-full rounded-full bg-sky-400/90 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-sky-400"
              >
                Open
              </button>
            </div>
            <PdfFullscreenViewer
              open={fullscreen}
              onClose={() => setFullscreen(false)}
              data={pdfData}
              filename={attachment.filename}
              fileId={attachment.fileId}
            />
          </>
        )}
      </div>
    </PostDocumentShell>
  );
}
