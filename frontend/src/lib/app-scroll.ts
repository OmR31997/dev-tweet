const APP_SCROLL_ROOT_SELECTOR = "[data-app-scroll-root]";

/** Main PWA scroll pane (not document.body). */
export function getAppScrollRoot(): HTMLElement | null {
  return document.querySelector(APP_SCROLL_ROOT_SELECTOR);
}

function scrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "auto";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "auto";
  }
  // Smooth nested scrolling is unreliable on touch browsers.
  if (window.matchMedia("(pointer: coarse)").matches) return "auto";
  return "smooth";
}

/**
 * Scroll the app main pane so `element` aligns under sticky chrome.
 * Falls back to scrollIntoView when the shell scroll root is absent.
 */
export function scrollAppToElement(element: Element) {
  const root = getAppScrollRoot();
  if (!root) {
    element.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    return;
  }

  const styles = getComputedStyle(element);
  const marginTop = Number.parseFloat(styles.scrollMarginTop) || 0;
  const marginBottom = Number.parseFloat(styles.scrollMarginBottom) || 0;

  const rootRect = root.getBoundingClientRect();
  const elRect = element.getBoundingClientRect();

  const deltaTop = elRect.top - rootRect.top - marginTop;
  const deltaBottom = elRect.bottom - rootRect.bottom + marginBottom;

  let nextTop = root.scrollTop;
  if (deltaTop < 0) {
    nextTop += deltaTop;
  } else if (deltaBottom > 0) {
    nextTop += deltaBottom;
  } else {
    return;
  }

  root.scrollTo({
    top: Math.max(0, nextTop),
    behavior: scrollBehavior(),
  });
}
