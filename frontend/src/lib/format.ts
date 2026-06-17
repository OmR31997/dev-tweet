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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Stable day key for grouping chat messages. */
export function chatDayKey(input?: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input ?? "");
  if (!Number.isFinite(date.getTime())) return "";
  return startOfDay(date).toISOString().slice(0, 10);
}

/** WhatsApp-style date label: Today, Yesterday, or formatted date. */
export function chatDateLabel(input?: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input ?? "");
  if (!Number.isFinite(date.getTime())) return "";

  const today = startOfDay(new Date());
  const messageDay = startOfDay(date);
  const diffDays = Math.round(
    (today.getTime() - messageDay.getTime()) / 86_400_000,
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** Time shown inside a chat bubble (e.g. 12:18 pm). */
export function formatMessageTime(input?: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input ?? "");
  if (!Number.isFinite(date.getTime())) return "";
  return date
    .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    .toLowerCase();
}

/** Short timestamp for chat list rows (Today → time, else date label). */
export function chatListTime(input?: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input ?? "");
  if (!Number.isFinite(date.getTime())) return "";

  const today = chatDayKey(new Date());
  const day = chatDayKey(date);
  if (day === today) return formatMessageTime(date);
  if (day === chatDayKey(new Date(Date.now() - 86_400_000))) return "Yesterday";

  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function letterChars(input: string): string[] {
  return [...input.matchAll(/\p{L}/gu)].map((match) => match[0]);
}

function firstLetter(word: string): string {
  return letterChars(word)[0] ?? "";
}

/** Initials from a display name (or email). */
export function initials(name?: string): string {
  if (!name) return "?";
  const cleaned = name.replace(/\([^)]*\)/g, " ").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";

  if (parts.length === 1) {
    const letters = letterChars(parts[0]);
    if (letters.length === 0) return "?";
    return letters.slice(0, 2).join("").toUpperCase();
  }

  const result = `${firstLetter(parts[0])}${firstLetter(parts[parts.length - 1])}`.toUpperCase();
  return result || "?";
}

/** WhatsApp-style last seen label for chat presence. */
export function formatLastSeen(input?: string | null): string {
  if (!input) return "";
  const date = new Date(input);
  if (!Number.isFinite(date.getTime())) return "";

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday.getTime() - 86_400_000);
  const time = date
    .toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    .toLowerCase();

  if (date >= startOfToday) return `last seen today at ${time}`;
  if (date >= startOfYesterday) return `last seen yesterday at ${time}`;

  const sameYear = date.getFullYear() === now.getFullYear();
  const dateLabel = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  return `last seen ${dateLabel} at ${time}`;
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
