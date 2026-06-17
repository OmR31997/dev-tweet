const LINK_REGEX =
  /https?:\/\/[^\s<>"')\]]+|www\.[^\s<>"')\]]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

export type MessageTextToken =
  | { type: "text"; value: string }
  | { type: "link"; value: string };

export function tokenizeMessageText(content: string): MessageTextToken[] {
  const tokens: MessageTextToken[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(LINK_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push({ type: "text", value: content.slice(lastIndex, index) });
    }
    tokens.push({ type: "link", value: match[0] });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < content.length) {
    tokens.push({ type: "text", value: content.slice(lastIndex) });
  }

  return tokens.length > 0 ? tokens : [{ type: "text", value: content }];
}

export function linkHref(value: string): string {
  if (value.includes("@")) return `mailto:${value}`;
  if (/^www\./i.test(value)) return `https://${value}`;
  return value;
}

const HTTP_URL_REGEX = /https?:\/\/[^\s<>"')\]]+/i;

/** First http(s) URL in a message, for WhatsApp-style link previews. */
export function extractPrimaryLink(content: string): string | null {
  const match = content.match(HTTP_URL_REGEX);
  return match?.[0] ?? null;
}

export function shouldShowLinkPreview(content: string): boolean {
  return Boolean(extractPrimaryLink(content));
}

/** True when the message is only a single URL (optional trailing slash). */
export function isLinkOnlyMessage(content: string, link: string): boolean {
  const trimmed = content.trim();
  if (!trimmed || !link) return false;

  if (trimmed === link) return true;

  const stripSlash = (value: string) => value.replace(/\/+$/, "");
  if (stripSlash(trimmed) === stripSlash(link)) return true;

  try {
    return new URL(trimmed).href === new URL(link).href;
  } catch {
    return false;
  }
}
