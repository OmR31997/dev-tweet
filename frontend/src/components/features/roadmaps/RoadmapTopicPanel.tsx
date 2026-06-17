"use client";

import type { ParsedRoadmapNode } from "@/lib/roadmaps/types";
import { roadmapShUrl } from "@/lib/roadmaps/parse-roadmap";
import { Button } from "@/components/ui/button";
import { ExternalLink, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function RoadmapTopicPanel({
  slug,
  node,
  onClose,
}: {
  slug: string;
  node: ParsedRoadmapNode;
  onClose: () => void;
}) {
  const t = useTranslations("Roadmaps");
  const externalUrl = roadmapShUrl(slug, node);

  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-border bg-card md:w-80 md:border-l md:border-t-0">
      <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {node.type === "title"
              ? t("nodeTypeTitle")
              : node.type === "topic"
                ? t("nodeTypeTopic")
                : t("nodeTypeSubtopic")}
          </p>
          <h2 className="mt-1 text-sm font-semibold leading-snug">{node.label}</h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={onClose}
          aria-label={t("closePanel")}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-sm text-muted-foreground">{t("topicHint")}</p>
        <Button asChild variant="outline" className="w-full">
          <a href={externalUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            {t("openOnRoadmapSh")}
          </a>
        </Button>
      </div>
    </aside>
  );
}
