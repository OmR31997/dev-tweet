import { NotionAPI } from "notion-client";
import type { ExtendedRecordMap } from "notion-types";

const notion = new NotionAPI();

export function toNotionRecordId(pageId: string): string {
  return pageId.replace(/-/g, "");
}

export async function fetchPublicNotionPage(
  pageId: string,
): Promise<ExtendedRecordMap> {
  return notion.getPage(toNotionRecordId(pageId));
}

export function getTitleFromRecordMap(
  recordMap: ExtendedRecordMap,
  pageId: string,
): string {
  const id = toNotionRecordId(pageId);
  const entry = recordMap.block[id]?.value;
  if (!entry || !("type" in entry) || entry.type !== "page") return "Course";

  const titleProp = entry.properties?.title;
  if (!Array.isArray(titleProp)) return "Course";

  const text = titleProp
    .flat()
    .map((part) => (typeof part === "string" ? part : ""))
    .join("");

  return text || "Course";
}

export function parseNotionHrefPageId(href: string): string | null {
  try {
    const url = new URL(href, "https://www.notion.so");
    const pathname = url.pathname;
    const match = pathname.match(
      /([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i,
    );
    if (!match?.[1]) return null;
    const raw = match[1].replace(/-/g, "");
    return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
  } catch {
    return null;
  }
}
