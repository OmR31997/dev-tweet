"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { getErrorMessage, useToggleRepost, type Post } from "@/lib/api";
import { useAuthUser } from "@/store";
import { useEffect, useState } from "react";

export function RepostDialog({
  post,
  open,
  onClose,
}: {
  post: Post;
  open: boolean;
  onClose: () => void;
}) {
  const me = useAuthUser();
  const toggleRepost = useToggleRepost();
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCaption("");
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !me) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toggleRepost.mutate(
      { id: post.id, caption: caption.trim() || undefined },
      {
        onSuccess: () => onClose(),
        onError: (err) => setError(getErrorMessage(err)),
      },
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
        <h2 className="text-lg font-semibold">Repost</h2>
        <div className="flex gap-3">
          <UserAvatar name={me.displayName} photoURL={me.photoURL} />
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            maxLength={1000}
            autoFocus
            placeholder="Add a caption (optional)"
            className="min-h-[96px] flex-1 resize-none rounded-lg border border-input bg-transparent p-3 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={toggleRepost.isPending}>
            {toggleRepost.isPending ? "Reposting…" : "Repost"}
          </Button>
        </div>
      </form>
    </div>
  );
}
