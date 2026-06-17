"use client";

import type { PostAttachment } from "@/lib/api";
import { fetchFileBlob } from "@/lib/api/fetch-file-blob";
import { formatFileSize, resolveChatFileUrl } from "@/lib/api/normalizers";
import { cn } from "@/lib/utils";
import { Download, FileText, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

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

export function PostPdfViewer({
  attachment,
  compact,
}: {
  attachment: PostAttachment;
  compact?: boolean;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const fileUrl = resolveChatFileUrl(attachment.fileId);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    setLoading(true);
    setError(false);
    setBlobUrl(null);

    fetchFileBlob(fileUrl)
      .then((blob) => {
        if (cancelled) return;
        const pdfBlob =
          blob.type === "application/pdf"
            ? blob
            : new Blob([blob], { type: "application/pdf" });
        objectUrl = URL.createObjectURL(pdfBlob);
        setBlobUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
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
        ) : error || !blobUrl ? (
          <p className="px-4 py-16 text-center text-sm text-muted-foreground">
            Could not preview this PDF. Use download to open the file.
          </p>
        ) : (
          <iframe
            title={attachment.filename}
            src={`${blobUrl}#toolbar=0&navpanes=0&view=FitH`}
            className={cn(
              "w-full border-0 bg-white",
              compact ? "h-56" : "h-[min(70vh,520px)]",
            )}
          />
        )}
      </div>
    </PostDocumentShell>
  );
}
