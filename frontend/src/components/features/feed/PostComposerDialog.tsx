"use client";

import { MobileSheet } from "@/components/common/MobileSheet";
import { PostComposerForm } from "./PostComposerForm";

export function PostComposerDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <MobileSheet
      open={open}
      onClose={onClose}
      title="Create post"
      titleId="create-post-title"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-5 sm:pb-5">
        <PostComposerForm autoFocus stickyActions onPosted={onClose} />
      </div>
    </MobileSheet>
  );
}
