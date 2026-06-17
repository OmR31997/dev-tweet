"use client";

import { useLinkPreview } from "@/lib/api/hooks/use-link-preview";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

export function LinkPreviewCard({
  url,
  mine,
}: {
  url: string;
  mine: boolean;
}) {
  const preview = useLinkPreview(url);
  const data = preview.data;
  const [imageFailed, setImageFailed] = useState(false);

  if (preview.isLoading) {
    return (
      <div
        className={cn(
          "chat-link-preview chat-link-preview--loading",
          mine ? "chat-link-preview--out" : "chat-link-preview--in",
        )}
        aria-hidden
      >
        <div className="chat-link-preview-card">
          <div className="chat-link-preview-thumb chat-link-preview-thumb--skeleton" />
          <div className="chat-link-preview-copy">
            <div className="chat-link-preview-line chat-link-preview-line--title" />
            <div className="chat-link-preview-line chat-link-preview-line--body" />
            <div className="chat-link-preview-line chat-link-preview-line--host" />
          </div>
        </div>
      </div>
    );
  }

  if (preview.isError || !data) return null;

  const hasRichPreview = Boolean(data.title || data.description || data.image);
  if (!hasRichPreview) return null;

  const hostname = (() => {
    try {
      return new URL(data.url).hostname.replace(/^www\./i, "");
    } catch {
      return data.siteName ?? url;
    }
  })();

  const showImage = Boolean(data.image) && !imageFailed;

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "chat-link-preview",
        mine ? "chat-link-preview--out" : "chat-link-preview--in",
      )}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="chat-link-preview-card">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.image}
            alt=""
            className="chat-link-preview-thumb"
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="chat-link-preview-thumb chat-link-preview-thumb--fallback">
            <ExternalLink className="size-4" aria-hidden />
          </div>
        )}
        <span className="chat-link-preview-copy">
          {data.title ? (
            <span className="chat-link-preview-title">{data.title}</span>
          ) : null}
          {data.description ? (
            <span className="chat-link-preview-description">
              {data.description}
            </span>
          ) : null}
          <span className="chat-link-preview-host">
            {data.siteName || hostname}
          </span>
        </span>
      </div>
    </a>
  );
}
