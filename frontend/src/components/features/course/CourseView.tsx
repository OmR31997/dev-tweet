"use client";

import { QueryState } from "@/components/common/QueryState";
import { Button } from "@/components/ui/button";
import {
  NOTION_COURSE_TITLE,
  notionCoursePublicUrl,
} from "@/config/course";
import { parseNotionApiError } from "@/lib/notion/errors";
import type { NotionBlocksResponse } from "@/lib/notion/types";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { CourseNotionPublic } from "./CourseNotionPublic";
import { NotionBlocks } from "./NotionBlocks";

export function CourseView({ initialPageId }: { initialPageId?: string }) {
  const t = useTranslations("Course");
  const [pageId, setPageId] = useState(() => initialPageId?.trim() ?? "");
  const [history, setHistory] = useState<string[]>([]);
  const [data, setData] = useState<NotionBlocksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      const trimmedPageId = pageId.trim();
      const url = trimmedPageId
        ? `/course-data?pageId=${encodeURIComponent(trimmedPageId)}`
        : "/course-data";
      const response = await fetch(url);
      const json = (await response.json()) as NotionBlocksResponse & {
        error?: string;
        errorCode?: string;
      };

      if (!response.ok) {
        setErrorCode(json.errorCode ?? "unknown");
        throw new Error(json.error ?? t("loadError"));
      }

      setData(json);
    } catch (err) {
      const parsed = parseNotionApiError(err);
      setError(parsed.message);
      setErrorCode((current) => current ?? parsed.code);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [pageId, t]);

  useEffect(() => {
    void loadCourse();
  }, [loadCourse]);

  const openSubPage = (nextPageId: string) => {
    setHistory((prev) => [...prev, pageId]);
    setPageId(nextPageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setHistory((prev) => {
      const next = [...prev];
      const previous = next.pop();
      if (previous) setPageId(previous);
      return next;
    });
  };

  const title = data?.title ?? NOTION_COURSE_TITLE;
  const publicUrl = notionCoursePublicUrl(data?.pageId || pageId);
  const needsSetup = data && !data.configured;
  const needsShare =
    errorCode === "not_shared" ||
    errorCode === "not_found" ||
    errorCode === "unauthorized" ||
    errorCode === "not_configured";
  const needsPublish = errorCode === "not_published";
  const isPublicMode = data?.mode === "public" && data.recordMap;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="chat-mobile-header flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        {history.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={goBack}
            aria-label={t("back")}
          >
            <ArrowLeft className="size-4" />
          </Button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold">{title}</h1>
          <p className="truncate text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">{t("openInNotion")}</span>
          </a>
        </Button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {needsSetup ? (
          <div className="mx-auto max-w-3xl space-y-4 px-5 py-10 text-center md:px-6">
            <p className="text-sm text-muted-foreground">{t("setupHint")}</p>
            <ol className="space-y-2 text-left text-sm text-muted-foreground">
              <li>{t("setupStep1")}</li>
              <li>{t("setupStep2")}</li>
              <li>{t("setupStep3")}</li>
            </ol>
            <Button asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                {t("openInNotion")}
              </a>
            </Button>
          </div>
        ) : needsPublish && error ? (
          <div className="mx-auto max-w-3xl space-y-5 px-5 py-10 md:px-6">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t("publishTitle")}</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>{t("publishStep1")}</li>
                <li>{t("publishStep2")}</li>
                <li>{t("publishStep3")}</li>
                <li>{t("publishStep4")}</li>
              </ol>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => void loadCourse()} variant="outline">
                {t("retry")}
              </Button>
              <Button asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  {t("openInNotion")}
                </a>
              </Button>
            </div>
          </div>
        ) : needsShare && error ? (
          <div className="mx-auto max-w-3xl space-y-5 px-5 py-10 md:px-6">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{t("shareTitle")}</p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>{t("shareStep1")}</li>
                <li>{t("shareStep2")}</li>
                <li>{t("shareStep3")}</li>
                <li>{t("shareStep4")}</li>
              </ol>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => void loadCourse()} variant="outline">
                {t("retry")}
              </Button>
              <Button asChild>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                  {t("openInNotion")}
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <QueryState
            isLoading={loading}
            isError={Boolean(error)}
            error={error ? new Error(error) : undefined}
            loadingMessage={t("loading")}
            onRetry={loadCourse}
            isEmpty={
              !loading &&
              data?.configured &&
              data.mode !== "public" &&
              data.blocks.length === 0
            }
            emptyMessage={t("empty")}
          >
            {isPublicMode && data.recordMap ? (
              <CourseNotionPublic
                recordMap={data.recordMap}
                onOpenPage={openSubPage}
              />
            ) : data?.configured && data.blocks.length > 0 ? (
              <article className="mx-auto max-w-3xl px-5 py-8 md:px-6">
                <NotionBlocks blocks={data.blocks} onOpenPage={openSubPage} />
              </article>
            ) : null}
          </QueryState>
        )}
      </div>

      <footer className="shrink-0 border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
        {t.rich("attribution", {
          link: (chunks) => (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              {chunks}
            </a>
          ),
        })}
      </footer>
    </div>
  );
}
