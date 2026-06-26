"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { PageLayout } from "@/components/common/PageLayout";
import { SearchInput } from "@/components/common/SearchInput";
import {
  filterRoadmaps,
  groupRoadmaps,
  GROUP_ORDER,
} from "@/lib/roadmaps/catalog";
import type { RoadmapGroup } from "@/lib/roadmaps/types";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

const GROUP_LABEL_KEYS: Record<RoadmapGroup, string> = {
  web: "groupWeb",
  backend: "groupBackend",
  devops: "groupDevops",
  languages: "groupLanguages",
  career: "groupCareer",
};

export function RoadmapsView() {
  const t = useTranslations("Roadmaps");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => filterRoadmaps(query), [query]);
  const grouped = useMemo(() => groupRoadmaps(filtered), [filtered]);

  return (
    <PageLayout
      header={<PageHeader title={t("title")} subtitle={t("subtitle")} />}
    >
      <div className="border-b border-border bg-card px-5 py-4">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-10"
        />
      </div>

      <div className="flex-1 px-5 py-4">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("noResults")}
          </p>
        ) : (
          GROUP_ORDER.map((group) => {
            const items = grouped[group];
            if (items.length === 0) return null;

            return (
              <section key={group} className="mb-8">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t(
                    GROUP_LABEL_KEYS[group] as
                      | "groupWeb"
                      | "groupBackend"
                      | "groupDevops"
                      | "groupLanguages"
                      | "groupCareer",
                  )}
                </h2>
                <div className="grid gap-2">
                  {items.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/roadmaps/${item.slug}`}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      <footer className="border-t border-border px-5 py-4 text-center text-xs text-muted-foreground">
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
    </PageLayout>
  );
}
