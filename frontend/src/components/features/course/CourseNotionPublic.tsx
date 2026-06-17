"use client";

import type { ExtendedRecordMap } from "notion-types";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { parseNotionHrefPageId } from "@/lib/notion/fetch-public";
import "react-notion-x/src/styles.css";

const NotionRenderer = dynamic(
  () => import("react-notion-x").then((mod) => mod.NotionRenderer),
  { ssr: false },
);

export function CourseNotionPublic({
  recordMap,
  onOpenPage,
}: {
  recordMap: ExtendedRecordMap;
  onOpenPage: (pageId: string) => void;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <div
      className="course-notion-public mx-auto max-w-4xl px-4 py-6"
      onClick={(event) => {
        const anchor = (event.target as HTMLElement).closest("a");
        if (!anchor?.href) return;
        const pageId = parseNotionHrefPageId(anchor.href);
        if (!pageId) return;
        event.preventDefault();
        onOpenPage(pageId);
      }}
    >
      <NotionRenderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={resolvedTheme === "dark"}
      />
    </div>
  );
}
