/** Cohort 2.0 FullStack Open Source — Notion course root page. */
export const NOTION_COURSE_PAGE_ID = process.env.NOTION_COURSE_PAGE_ID ?? "";

export const NOTION_COURSE_TITLE =
  process.env.NOTION_COURSE_TITLE ?? "Cohort 2.0 FullStack Open Source";

/** `public` = published Notion page (no integration). `api` = official Notion API. */
export const NOTION_ACCESS_MODE =
  process.env.NOTION_ACCESS_MODE === "api" ? "api" : "public";

function notionPagePublicUrl(pageId: string): string {
  const compact = pageId.replace(/-/g, "");
  return `https://www.notion.so/${compact}`;
}

/** Public Notion URL (set NOTION_COURSE_PUBLIC_URL or derive from NOTION_COURSE_PAGE_ID). */
export const NOTION_COURSE_PUBLIC_URL =
  process.env.NOTION_COURSE_PUBLIC_URL ??
  (NOTION_COURSE_PAGE_ID ? notionPagePublicUrl(NOTION_COURSE_PAGE_ID) : "");

export function notionCoursePublicUrl(pageId?: string): string {
  if (!pageId || pageId === NOTION_COURSE_PAGE_ID) {
    return NOTION_COURSE_PUBLIC_URL;
  }
  return notionPagePublicUrl(pageId);
}
