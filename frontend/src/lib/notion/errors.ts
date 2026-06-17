export function normalizeNotionPageId(raw: string): string {
  const trimmed = raw.trim();

  const fromUrl = trimmed.match(
    /([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})(?:\?|$)/i,
  );
  const compact = (fromUrl?.[1] ?? trimmed).replace(/-/g, "");

  if (!/^[0-9a-f]{32}$/i.test(compact)) {
    return trimmed;
  }

  return `${compact.slice(0, 8)}-${compact.slice(8, 12)}-${compact.slice(12, 16)}-${compact.slice(16, 20)}-${compact.slice(20)}`;
}

export type NotionApiErrorCode =
  | "not_configured"
  | "not_shared"
  | "not_found"
  | "unauthorized"
  | "unknown";

export function parseNotionApiError(error: unknown): {
  code: NotionApiErrorCode;
  message: string;
} {
  const raw =
    error instanceof Error ? error.message : "Failed to load course content";

  if (raw.includes("NOTION_API_KEY is not configured")) {
    return { code: "not_configured", message: raw };
  }

  if (raw.includes("401") || raw.includes("unauthorized")) {
    return {
      code: "unauthorized",
      message:
        "Notion API key is invalid. Check NOTION_API_KEY in frontend/.env.",
    };
  }

  if (
    raw.includes("object_not_found") ||
    raw.includes('"code":"object_not_found"')
  ) {
    return {
      code: "not_shared",
      message:
        "This Notion page is not shared with your integration yet. Open the page in Notion → Share → invite your integration.",
    };
  }

  if (raw.includes("404")) {
    return {
      code: "not_found",
      message:
        "Notion page not found. Check NOTION_COURSE_PAGE_ID or share the page with your integration.",
    };
  }

  return { code: "unknown", message: raw };
}
