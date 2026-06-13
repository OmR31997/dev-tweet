/** Lightweight relative-time formatter (no external date lib). */
export function timeAgo(input?: string | number | Date): string {
  if (!input) return "";
  const date = input instanceof Date ? input : new Date(input);
  const ms = Date.now() - date.getTime();
  if (!Number.isFinite(ms)) return "";

  const sec = Math.round(ms / 1000);
  if (sec < 45) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d`;
  const week = Math.round(day / 7);
  if (week < 5) return `${week}w`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

/** Initials from a display name (or email). */
export function initials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Extract `#hashtags` from post content (lowercased, de-duplicated). */
export function extractTags(content: string): string[] {
  const found = content.match(/#([a-z0-9_]+)/gi) ?? [];
  const seen = new Set<string>();
  for (const raw of found) {
    seen.add(raw.slice(1).toLowerCase());
  }
  return [...seen];
}
