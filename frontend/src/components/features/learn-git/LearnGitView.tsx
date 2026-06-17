"use client";

import { Button } from "@/components/ui/button";
import { LEARN_GIT_BRANCHING_URL } from "@/config/learn-git";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

export function LearnGitView() {
  const t = useTranslations("LearnGit");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">{t("title")}</h1>
          <p className="truncate text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <a
            href={LEARN_GIT_BRANCHING_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="size-4" />
            <span className="hidden sm:inline">{t("openExternal")}</span>
          </a>
        </Button>
      </header>

      <iframe
        src={LEARN_GIT_BRANCHING_URL}
        title={t("title")}
        className="min-h-0 flex-1 w-full border-0 bg-background"
        allow="fullscreen"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      <footer className="shrink-0 border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
        {t.rich("attribution", {
          link: (chunks) => (
            <a
              href={LEARN_GIT_BRANCHING_URL}
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
