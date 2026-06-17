import type { ExtendedRecordMap } from "notion-types";

export interface NotionRichText {
  type: string;
  plain_text: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
}

export interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  children?: NotionBlock[];
  [key: string]: unknown;
}

export interface NotionPageContent {
  pageId: string;
  title: string;
  blocks: NotionBlock[];
}

export interface NotionBlocksResponse {
  pageId: string;
  title: string;
  blocks: NotionBlock[];
  configured: boolean;
  mode?: "api" | "public";
  recordMap?: ExtendedRecordMap;
  errorCode?: string;
}
