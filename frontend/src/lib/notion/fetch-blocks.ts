import type { NotionBlock, NotionRichText } from "./types";
import { parseNotionApiError } from "./errors";

const NOTION_VERSION = "2022-06-28";
const MAX_DEPTH = 4;

function getApiKey(): string | undefined {
  return process.env.NOTION_API_KEY;
}

async function notionFetch<T>(path: string): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("NOTION_API_KEY is not configured");
  }

  const response = await fetch(`https://api.notion.com/v1${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": NOTION_VERSION,
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    const body = await response.text();
    let code = "";
    try {
      const parsed = JSON.parse(body) as { code?: string };
      code = parsed.code ?? "";
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(
      `Notion API ${response.status}${code ? `:${code}` : ""}: ${body.slice(0, 300)}`,
    );
  }

  return response.json() as Promise<T>;
}

export function extractRichText(
  value:
    | { rich_text?: NotionRichText[]; caption?: NotionRichText[] }
    | undefined,
): NotionRichText[] {
  return value?.rich_text ?? value?.caption ?? [];
}

export function richTextToPlain(rich: NotionRichText[]): string {
  return rich.map((part) => part.plain_text).join("");
}

async function listBlockChildren(blockId: string): Promise<NotionBlock[]> {
  const results: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const query = cursor ? `?start_cursor=${cursor}` : "";
    const data = await notionFetch<{
      results: NotionBlock[];
      has_more: boolean;
      next_cursor: string | null;
    }>(`/blocks/${blockId}/children${query}`);

    results.push(...data.results);
    cursor = data.has_more ? (data.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return results;
}

async function hydrateBlocks(
  blocks: NotionBlock[],
  depth: number,
): Promise<NotionBlock[]> {
  if (depth >= MAX_DEPTH) return blocks;

  return Promise.all(
    blocks.map(async (block) => {
      if (!block.has_children) return block;
      const children = await listBlockChildren(block.id);
      return {
        ...block,
        children: await hydrateBlocks(children, depth + 1),
      };
    }),
  );
}

export async function fetchNotionPage(pageId: string): Promise<{
  title: string;
  blocks: NotionBlock[];
}> {
  const page = await notionFetch<{
    properties?: Record<
      string,
      { type: string; title?: NotionRichText[] }
    >;
  }>(`/pages/${pageId}`);

  let title = "Course";
  for (const prop of Object.values(page.properties ?? {})) {
    if (prop.type === "title" && prop.title) {
      title = richTextToPlain(prop.title) || title;
      break;
    }
  }

  const blocks = await listBlockChildren(pageId);
  const hydrated = await hydrateBlocks(blocks, 0);

  return { title, blocks: hydrated };
}

export function isNotionConfigured(): boolean {
  return Boolean(getApiKey());
}
