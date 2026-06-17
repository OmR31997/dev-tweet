"use client";

import { useEffect, useState } from "react";

export type DebouncedValueOptions = {
  /** Clear debounced output immediately when the input is empty. */
  flushOnEmpty?: boolean;
  /** When this key changes, sync debounced value to the current input immediately. */
  resetKey?: unknown;
};

export function useDebouncedValue<T>(
  value: T,
  delay = 300,
  options?: DebouncedValueOptions,
): T {
  const { flushOnEmpty = true, resetKey } = options ?? {};
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    setDebounced(value);
    // Only re-sync when callers intentionally bump the session key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  useEffect(() => {
    if (flushOnEmpty && value === "") {
      setDebounced(value);
      return;
    }

    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay, flushOnEmpty]);

  return debounced;
}
