/** Braille patterns (U+2800–U+28FF), box drawing, and block elements used in text art. */
const TEXT_ART_CHAR_PATTERN = /[\u2500-\u28FF]/g;

const LONG_CHAR_THRESHOLD = 400;
const LONG_LINE_THRESHOLD = 10;
const COLLAPSED_LINE_LIMIT = 8;
const COLLAPSED_CHAR_LIMIT = 320;
const TEXT_ART_MAX_HEIGHT_PX = 480;
export const TEXT_ART_COLLAPSED_HEIGHT_PX = 200;
const TEXT_ART_COLLAPSE_MIN_LINES = 12;

const MIN_ART_LINES = 3;
const MIN_ART_SPECIAL_CHARS = 12;
const MIN_ART_SPECIAL_RATIO = 0.2;

export function normalizeMessageContent(content: string): string {
  return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function countSpecialChars(text: string): number {
  return (text.match(TEXT_ART_CHAR_PATTERN) ?? []).length;
}

/** Guess original line width when newlines were stripped (e.g. pasted into a single-line input). */
export function detectTextArtLineWidth(text: string): number | null {
  const len = text.length;
  if (len < 80) return null;

  let bestWidth = 0;
  let bestScore = -1;

  for (let width = 28; width <= 72; width++) {
    const lineCount = Math.ceil(len / width);
    if (lineCount < 4) continue;

    const remainder = len % width;
    const fitScore = remainder === 0 ? 1 : 1 - remainder / width;
    const lineCountScore = Math.min(lineCount / 12, 1);
    const score = fitScore * 0.75 + lineCountScore * 0.25;

    if (score > bestScore) {
      bestScore = score;
      bestWidth = width;
    }
  }

  if (!bestWidth) return null;
  const remainder = len % bestWidth;
  return remainder <= 2 ? bestWidth : null;
}

export function formatTextArtForDisplay(content: string): string {
  const normalized = normalizeMessageContent(content);
  if (!isTextArt(normalized)) return normalized;

  const trimmed = normalized.trim();
  const lines = trimmed.split("\n");
  if (lines.length > 1) return trimmed;

  const width = detectTextArtLineWidth(trimmed);
  if (!width) return trimmed;

  const rows: string[] = [];
  for (let i = 0; i < trimmed.length; i += width) {
    rows.push(trimmed.slice(i, i + width));
  }
  return rows.join("\n");
}

export function isTextArt(content: string): boolean {
  const normalized = normalizeMessageContent(content);
  const trimmed = normalized.trim();
  if (!trimmed) return false;

  const lines = trimmed.split("\n");
  const specialCount = countSpecialChars(trimmed);
  const specialRatio = specialCount / trimmed.length;

  if (lines.length === 1 && trimmed.length >= 80 && specialRatio >= 0.3) {
    return true;
  }

  if (lines.length < MIN_ART_LINES) return false;

  if (specialCount >= MIN_ART_SPECIAL_CHARS && specialRatio >= MIN_ART_SPECIAL_RATIO) {
    return true;
  }

  const maxLineLength = Math.max(...lines.map((line) => line.length));
  const avgLineLength =
    lines.reduce((sum, line) => sum + line.length, 0) / lines.length;

  if (
    lines.length >= 4 &&
    maxLineLength >= 24 &&
    avgLineLength >= 16 &&
    specialRatio >= 0.12
  ) {
    return true;
  }

  return false;
}

/** @deprecated Use {@link isTextArt}. */
export function isBrailleArt(content: string): boolean {
  return isTextArt(content);
}

export function shouldCollapseTextArt(content: string): boolean {
  const display = formatTextArtForDisplay(content);
  return display.split("\n").length >= TEXT_ART_COLLAPSE_MIN_LINES;
}

export function shouldCollapseMessage(content: string): boolean {
  const normalized = normalizeMessageContent(content);
  if (isTextArt(normalized)) return shouldCollapseTextArt(normalized);
  if (normalized.length > LONG_CHAR_THRESHOLD) return true;
  return normalized.split("\n").length > LONG_LINE_THRESHOLD;
}

export function collapsedPreview(content: string): string {
  const lines = content.split("\n");
  if (lines.length > COLLAPSED_LINE_LIMIT) {
    return `${lines.slice(0, COLLAPSED_LINE_LIMIT).join("\n")}…`;
  }
  if (content.length > COLLAPSED_CHAR_LIMIT) {
    return `${content.slice(0, COLLAPSED_CHAR_LIMIT)}…`;
  }
  return content;
}

export function messagePreviewText(content: string): string {
  if (isTextArt(content)) return "Text art";
  return content;
}
