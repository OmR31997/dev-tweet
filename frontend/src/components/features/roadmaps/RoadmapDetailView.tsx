"use client";

import { QueryState } from "@/components/common/QueryState";
import { Button } from "@/components/ui/button";
import { getRoadmapBySlug } from "@/lib/roadmaps/catalog";
import type { ParsedRoadmapNode, RoadmapJson } from "@/lib/roadmaps/types";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { RoadmapFlowCanvas } from "./RoadmapFlowCanvas";
import { RoadmapTopicPanel } from "./RoadmapTopicPanel";

export function RoadmapDetailView({ slug }: { slug: string }) {
  const t = useTranslations("Roadmaps");
  const catalogItem = getRoadmapBySlug(slug);
  const [data, setData] = useState<RoadmapJson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<ParsedRoadmapNode | null>(
    null,
  );

  const loadRoadmap = useCallback(async () => {
    if (!catalogItem) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/roadmaps-data/${slug}`);
      if (!response.ok) throw new Error(t("loadError"));
      const json = (await response.json()) as RoadmapJson;
      if (!json?.nodes?.length) throw new Error(t("loadError"));
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadError"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [catalogItem, slug, t]);

  useEffect(() => {
    void loadRoadmap();
  }, [loadRoadmap]);

  if (!catalogItem) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-muted-foreground">{t("notFound")}</p>
        <Button asChild variant="outline">
          <Link href="/roadmaps">
            <ArrowLeft className="size-4" />
            {t("backToCatalog")}
          </Link>
        </Button>
      </div>
    );
  }

  const roadmapUrl = `https://roadmap.sh/${slug}`;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="chat-mobile-header flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <Button asChild variant="ghost" size="icon" className="size-9 shrink-0">
          <Link href="/roadmaps" aria-label={t("backToCatalog")}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold">{catalogItem.title}</h1>
          <p className="truncate text-xs text-muted-foreground">
            {catalogItem.description}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <a href={roadmapUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">{t("openOnRoadmapSh")}</span>
          </a>
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <QueryState
          isLoading={loading}
          isError={Boolean(error)}
          error={error ? new Error(error) : undefined}
          loadingMessage={t("loading")}
          onRetry={loadRoadmap}
          isEmpty={!loading && !data}
          emptyMessage={t("notFound")}
        >
          {data ? (
            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <div className="min-h-0 flex-1">
              <RoadmapFlowCanvas
                data={data}
                onSelectNode={setSelectedNode}
              />
            </div>
            {selectedNode ? (
              <RoadmapTopicPanel
                slug={slug}
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
              />
            ) : null}
          </div>
          ) : null}
        </QueryState>
      </div>

      <footer className="shrink-0 border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
        {t.rich("attribution", {
          link: (chunks) => (
            <a
              href="https://roadmap.sh"
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
