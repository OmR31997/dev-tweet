"use client";

import { Button } from "@/components/ui/button";
import { getErrorMessage, useUpdatePost, type Post } from "@/lib/api";
import { extractTags } from "@/lib/format";
import { useEffect, useState } from "react";

export function EditPostDialog({
  post,
  open,
  onClose,
}: {
  post: Post;
  open: boolean;
  onClose: () => void;
}) {
  const update = useUpdatePost();
  const [content, setContent] = useState(post.content);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setContent(post.content);
  }, [open, post.content]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update.mutate(
      { id: post.id, dto: { content: content.trim(), tags: extractTags(content) } },
      {
        onSuccess: () => onClose(),
        onError: (err) => setError(getErrorMessage(err)),
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className="w-full max-w-lg space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <h2 className="text-lg font-semibold">Edit post</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          maxLength={1000}
          autoFocus
          className="w-full resize-none rounded-lg border border-input bg-transparent p-3 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={update.isPending || content.trim().length === 0}
          >
            {update.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
