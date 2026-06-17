/** Cohort 2.0 FullStack Open Source — Notion course root page. */
export const NOTION_COURSE_PAGE_ID =
  process.env.NOTION_COURSE_PAGE_ID ?? "23576518-421c-80fa-a249-d8170a15dd2d";

export const NOTION_COURSE_TITLE =
  process.env.NOTION_COURSE_TITLE ?? "Cohort 2.0 FullStack Open Source";

/** `public` = published Notion page (no integration). `api` = official Notion API. */
export const NOTION_ACCESS_MODE =
  process.env.NOTION_ACCESS_MODE === "api" ? "api" : "public";

/** Public Notion URL (fallback when API key is not configured). */
export const NOTION_COURSE_PUBLIC_URL =
  process.env.NOTION_COURSE_PUBLIC_URL ??
  "https://www.notion.so/Cohort-2-0-FullStack-Open-Source-23576518421c80faa249d8170a15dd2d";

export function notionCoursePublicUrl(pageId?: string): string {
  if (!pageId || pageId === NOTION_COURSE_PAGE_ID) {
    return NOTION_COURSE_PUBLIC_URL;
  }
  const compact = pageId.replace(/-/g, "");
  return `https://www.notion.so/${compact}`;
}
