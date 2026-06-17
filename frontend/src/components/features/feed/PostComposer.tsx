"use client";

import { PostComposerForm } from "./PostComposerForm";

export function PostComposer({
  composerRef,
}: {
  composerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={composerRef}
      className="border-b border-border bg-card px-5 py-4"
    >
      <PostComposerForm />
    </div>
  );
}
