"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  getErrorMessage,
  resolveImageUrl,
  useCreatePost,
  useUploadImage,
} from "@/lib/api";
import { extractTags } from "@/lib/format";
import { useAuthUser } from "@/store";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

const MAX_LENGTH = 1000;
const MAX_IMAGES = 4;

export function PostComposer() {
  const me = useAuthUser();
  const createPost = useCreatePost();
  const uploadImage = useUploadImage();
  const fileRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    (content.trim().length > 0 || imageIds.length > 0) &&
    content.length <= MAX_LENGTH &&
    !createPost.isPending;

  const onPickFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    const room = MAX_IMAGES - imageIds.length;
    const chosen = Array.from(files).slice(0, room);
    for (const file of chosen) {
      try {
        const result = await uploadImage.mutateAsync(file);
        setImageIds((prev) => [...prev, result.id]);
      } catch (err) {
        setError(getErrorMessage(err));
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    createPost.mutate(
      {
        content: content.trim(),
        imageIds,
        tags: extractTags(content),
      },
      {
        onSuccess: () => {
          setContent("");
          setImageIds([]);
          setError(null);
        },
        onError: (err) => setError(getErrorMessage(err)),
      }
    );
  };

  return (
    <form
      onSubmit={onSubmit}
      className="border-b border-border bg-card px-5 py-4"
    >
      <div className="flex gap-3">
        <UserAvatar
          name={me?.displayName}
          photoURL={me?.photoURL}
          className="mt-1"
        />
        <div className="min-w-0 flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you building?"
            rows={3}
            className="w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />

          {imageIds.length > 0 ? (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {imageIds.map((id) => (
                <div key={id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveImageUrl(id)}
                    alt=""
                    className="h-32 w-full rounded-lg border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImageIds((prev) => prev.filter((x) => x !== id))
                    }
                    className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-black/60 text-white"
                    aria-label="Remove image"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {error ? (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={
                  imageIds.length >= MAX_IMAGES || uploadImage.isPending
                }
                className="text-primary transition-colors hover:text-primary/80 disabled:opacity-40"
                aria-label="Add image"
              >
                {uploadImage.isPending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <ImagePlus className="size-5" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => onPickFiles(e.target.files)}
              />
              <span className="text-xs text-muted-foreground">
                {content.length}/{MAX_LENGTH}
              </span>
            </div>

            <Button type="submit" size="sm" disabled={!canSubmit}>
              {createPost.isPending ? "Posting…" : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
