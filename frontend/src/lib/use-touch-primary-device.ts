"use client";

import { useEffect, useState } from "react";

const TOUCH_PRIMARY_QUERY =
  "(max-width: 767px), (hover: none), (pointer: coarse)";

function readTouchPrimaryDevice() {
  if (typeof window === "undefined") return true;
  return window.matchMedia(TOUCH_PRIMARY_QUERY).matches;
}

/** Phones/tablets and touch-first devices (incl. many iPads). */
export function useTouchPrimaryDevice() {
  const [touchPrimary, setTouchPrimary] = useState(readTouchPrimaryDevice);

  useEffect(() => {
    const media = window.matchMedia(TOUCH_PRIMARY_QUERY);
    const onChange = () => setTouchPrimary(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return touchPrimary;
}
