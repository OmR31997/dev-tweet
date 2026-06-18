"use client";

import { useEffect, useState } from "react";

/** Keyboard / browser chrome inset for fixed bottom sheets on mobile. */
export function useVisualViewportInset(active: boolean) {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (!active || typeof window === "undefined" || !window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;
    const update = () => {
      setInset(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop),
      );
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, [active]);

  return inset;
}
