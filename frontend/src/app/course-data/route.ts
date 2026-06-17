import {
  NOTION_ACCESS_MODE,
  NOTION_COURSE_PAGE_ID,
  NOTION_COURSE_TITLE,
} from "@/config/course";
import { fetchNotionPage, isNotionConfigured } from "@/lib/notion/fetch-blocks";
import {
  normalizeNotionPageId,
  parseNotionApiError,
} from "@/lib/notion/errors";
import {
  fetchPublicNotionPage,
  getTitleFromRecordMap,
} from "@/lib/notion/fetch-public";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPageId = searchParams.get("pageId") ?? NOTION_COURSE_PAGE_ID;
  const pageId = normalizeNotionPageId(rawPageId);

  if (NOTION_ACCESS_MODE === "public") {
    try {
      const recordMap = await fetchPublicNotionPage(pageId);
      const title = getTitleFromRecordMap(recordMap, pageId);
      return NextResponse.json({
        configured: true,
        mode: "public",
        pageId,
        title,
        blocks: [],
        recordMap,
      });
    } catch {
      return NextResponse.json(
        {
          error:
            "Could not load the public Notion page. In Notion: Share → Publish → Publish to web, then try again.",
          errorCode: "not_published",
          pageId,
        },
        { status: 403 },
      );
    }
  }

  if (!isNotionConfigured()) {
    return NextResponse.json({
      configured: false,
      pageId,
      title: NOTION_COURSE_TITLE,
      blocks: [],
    });
  }

  try {
    const { title, blocks } = await fetchNotionPage(pageId);
    return NextResponse.json({
      configured: true,
      mode: "api",
      pageId,
      title,
      blocks,
    });
  } catch (error) {
    const parsed = parseNotionApiError(error);
    return NextResponse.json(
      {
        error: parsed.message,
        errorCode: parsed.code,
        pageId,
      },
      { status: parsed.code === "not_shared" ? 403 : 502 },
    );
  }
}
