"use client";

import { getAppScrollRoot } from "@/lib/app-scroll";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { PostComposerDialog } from "./PostComposerDialog";

function getScrollRoot() {
  return getAppScrollRoot() ?? document.querySelector("main");
}

export function FeedFloatingAction({
  composerRef,
}: {
  composerRef: React.RefObject<HTMLElement | null>;
}) {
  const [showFab, setShowFab] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const target = composerRef.current;
    const root = getScrollRoot();
    if (!target || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => setShowFab(!entry.isIntersecting),
      { root, threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [composerRef]);

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        aria-label="Create post"
        className={`fixed right-5 z-40 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl max-md:bottom-[calc(var(--mobile-nav-safe-height)+1rem)] md:bottom-8 ${
          showFab
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <Plus className="size-7" strokeWidth={2.5} />
      </button>

      <PostComposerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
