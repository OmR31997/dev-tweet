/** Invoke `fn` at most once per `intervalMs` (trailing edge). */
export function throttle<T extends (...args: never[]) => void>(
  fn: T,
  intervalMs: number,
): (...args: Parameters<T>) => void {
  let lastCallAt = 0;
  let trailingTimer: ReturnType<typeof setTimeout> | null = null;
  let trailingArgs: Parameters<T> | null = null;

  const invoke = (args: Parameters<T>) => {
    lastCallAt = Date.now();
    fn(...args);
  };

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const elapsed = now - lastCallAt;

    if (elapsed >= intervalMs) {
      if (trailingTimer) {
        clearTimeout(trailingTimer);
        trailingTimer = null;
        trailingArgs = null;
      }
      invoke(args);
      return;
    }

    trailingArgs = args;
    if (trailingTimer) return;

    trailingTimer = setTimeout(() => {
      trailingTimer = null;
      if (trailingArgs) {
        const pending = trailingArgs;
        trailingArgs = null;
        invoke(pending);
      }
    }, intervalMs - elapsed);
  };
}

/** Delay `fn` until `waitMs` has passed without another call. */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  waitMs: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, waitMs);
  };
}
