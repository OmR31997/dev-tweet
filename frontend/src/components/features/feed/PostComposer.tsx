"use client";

import { PAGE_GUTTER } from "@/components/common/PageLayout";
import { cn } from "@/lib/utils";
import { PostComposerForm } from "./PostComposerForm";

export function PostComposer({
  composerRef,
}: {
  composerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={composerRef}
      className={cn("border-b border-border bg-card py-4", PAGE_GUTTER)}
    >
      <PostComposerForm />
    </div>
  );
}
