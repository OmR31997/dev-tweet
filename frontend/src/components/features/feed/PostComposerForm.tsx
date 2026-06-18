"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  getErrorMessage,
  useCreatePost,
  useUploadChatFile,
  useUploadImage,
  type PostAttachment,
} from "@/lib/api";
import { extractTags } from "@/lib/format";
import { useAuthUser } from "@/store";
import {
  FileSpreadsheet,
  FileText,
  ImagePlus,
  Loader2,
  Paperclip,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
import { PostComposerMediaPreview } from "./PostMedia";
import {
  fileKind,
  POST_FILE_ACCEPT,
  POST_MAX_ATTACHMENTS,
  POST_MAX_IMAGES,
  POST_MAX_LENGTH,
} from "./post-composer.utils";

export function PostComposerForm({
  onPosted,
  showAvatar = true,
  autoFocus,
}: {
  onPosted?: () => void;
  showAvatar?: boolean;
  autoFocus?: boolean;
}) {
  const me = useAuthUser();
  const createPost = useCreatePost();
  const uploadImage = useUploadImage();
  const uploadFile = useUploadChatFile();
  const fileRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const mediaCount = imageIds.length + attachments.length;
  const canSubmit =
    (content.trim().length > 0 || mediaCount > 0) &&
    content.length <= POST_MAX_LENGTH &&
    !uploading;

  const reset = () => {
    setContent("");
    setImageIds([]);
    setAttachments([]);
    setError(null);
  };

  const onPickFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const kind = fileKind(file);
        if (kind === "image") {
          if (imageIds.length >= POST_MAX_IMAGES) continue;
          const result = await uploadImage.mutateAsync(file);
          setImageIds((prev) => [...prev, result.id]);
          continue;
        }

        if (attachments.length >= POST_MAX_ATTACHMENTS) continue;
        const uploaded = await uploadFile.mutateAsync(file);
        setAttachments((prev) => [
          ...prev,
          {
            fileId: uploaded.fileId,
            mimeType: uploaded.mimeType,
            filename: uploaded.filename,
            size: uploaded.size,
          },
        ]);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const dto = {
      content: content.trim(),
      ...(imageIds.length > 0 ? { imageIds } : {}),
      ...(attachments.length > 0 ? { attachments } : {}),
      tags: extractTags(content),
    };

    reset();
    onPosted?.();
    createPost.mutate(dto, {
      onError: (err) => setError(getErrorMessage(err)),
    });
  };

  const busy = uploading || uploadImage.isPending || uploadFile.isPending;

  return (
    <form onSubmit={onSubmit}>
      <div className="flex gap-3">
        {showAvatar ? (
          <UserAvatar
            name={me?.displayName}
            photoURL={me?.photoURL}
            className="mt-1"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <textarea
            autoFocus={autoFocus}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you building?"
            rows={3}
            className="w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />

          <PostComposerMediaPreview
            imageIds={imageIds}
            attachments={attachments}
            onRemoveImage={(id) =>
              setImageIds((prev) => prev.filter((item) => item !== id))
            }
            onRemoveAttachment={(fileId) =>
              setAttachments((prev) =>
                prev.filter((item) => item.fileId !== fileId),
              )
            }
          />

          {error ? (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy || mediaCount >= POST_MAX_IMAGES + POST_MAX_ATTACHMENTS}
                className="grid size-9 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
                aria-label="Add photo"
                title="Photo"
              >
                {busy ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <ImagePlus className="size-5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy || attachments.length >= POST_MAX_ATTACHMENTS}
                className="grid size-9 place-items-center rounded-full text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
                aria-label="Add video or document"
                title="Video, PDF, or CSV"
              >
                <Paperclip className="size-5" />
              </button>
              <span className="ml-2 hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex">
                <span className="inline-flex items-center gap-1">
                  <ImagePlus className="size-3.5" /> Image
                </span>
                <span className="inline-flex items-center gap-1">
                  <Video className="size-3.5" /> Video
                </span>
                <span className="inline-flex items-center gap-1">
                  <FileText className="size-3.5" /> PDF
                </span>
                <span className="inline-flex items-center gap-1">
                  <FileSpreadsheet className="size-3.5" /> CSV
                </span>
              </span>
              <input
                ref={fileRef}
                type="file"
                accept={POST_FILE_ACCEPT}
                multiple
                hidden
                onChange={(e) => onPickFiles(e.target.files)}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {content.length}/{POST_MAX_LENGTH}
              </span>
              <Button type="submit" size="sm" disabled={!canSubmit}>
                {createPost.isPending ? "Posting…" : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
