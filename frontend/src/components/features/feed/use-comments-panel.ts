"use client";

import { useEffect, useState } from "react";

function scrollToComments(postId: string) {
  const panel = document.querySelector(`[data-comments-panel="${postId}"]`);
  const article = document.querySelector(`[data-post-comments="${postId}"]`);
  const target = panel ?? article;
  if (!target) return;

  target.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });
}

export function useCommentsPanel() {
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!openPostId) return;

    const onPointerDown = (event: MouseEvent) => {
      const panel = document.querySelector(
        `[data-post-comments="${openPostId}"]`,
      );
      if (panel && !panel.contains(event.target as Node)) {
        setOpenPostId(null);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [openPostId]);

  useEffect(() => {
    if (!openPostId) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToComments(openPostId));
    });
  }, [openPostId]);

  return {
    isOpen: (postId: string) => openPostId === postId,
    toggle: (postId: string) =>
      setOpenPostId((current) => (current === postId ? null : postId)),
    close: () => setOpenPostId(null),
  };
}
