"use client";

import { messagePreviewText } from "./message-content.utils";
import { cn } from "@/lib/utils";
import type { ReplyTarget } from "@/lib/api";
import { X } from "lucide-react";

export function ReplyPreview({
  reply,
  onCancel,
}: {
  reply: ReplyTarget;
  onCancel: () => void;
}) {
  return (
    <div className="flex items-stretch gap-3 border-b border-border bg-muted/40 px-4 py-2.5">
      <div className="w-1 shrink-0 rounded-full bg-primary" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-primary">
          {reply.senderName}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {messagePreviewText(reply.content)}
        </p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        aria-label="Cancel reply"
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        )}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
