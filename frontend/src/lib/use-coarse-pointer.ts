"use client";

import { useEffect, useState } from "react";

function readCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/** True on phones/tablets with touch-primary input. */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(readCoarsePointer);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse)");
    const onChange = () => setCoarse(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return coarse;
}
