"use client";

import { scrollAppToElement } from "@/lib/app-scroll";
import { useEffect, useState } from "react";

function scrollToComments(postId: string) {
  const panel = document.querySelector(`[data-comments-panel="${postId}"]`);
  const article = document.querySelector(`[data-post-comments="${postId}"]`);
  const target = panel ?? article;
  if (!target) return;

  scrollAppToElement(target);
}

export function useCommentsPanel() {
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  useEffect(() => {
    if (!openPostId) return;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const panel = document.querySelector(
        `[data-post-comments="${openPostId}"]`,
      );
      if (panel && !panel.contains(event.target as Node)) {
        setOpenPostId(null);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openPostId]);

  useEffect(() => {
    if (!openPostId) return;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToComments(openPostId));
    });
    return () => cancelAnimationFrame(frame);
  }, [openPostId]);

  return {
    isOpen: (postId: string) => openPostId === postId,
    toggle: (postId: string) =>
      setOpenPostId((current) => (current === postId ? null : postId)),
    close: () => setOpenPostId(null),
  };
}
