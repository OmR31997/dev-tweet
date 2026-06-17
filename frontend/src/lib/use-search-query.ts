"use client";

import { useEffect, useState } from "react";
import { useDebouncedValue } from "./use-debounce";

/** Search field state with debounce + reset when a dialog/panel re-opens. */
export function useSearchQuery(open: boolean, delay = 300) {
  const [query, setQuery] = useState("");
  const [session, setSession] = useState(0);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSession((current) => current + 1);
  }, [open]);

  const q = useDebouncedValue(query.trim(), delay, {
    resetKey: session,
    flushOnEmpty: true,
  });

  return { query, setQuery, q };
}
