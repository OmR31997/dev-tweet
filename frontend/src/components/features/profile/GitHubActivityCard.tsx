"use client";

import { QueryState } from "@/components/common/QueryState";
import { useGithubActivity } from "@/lib/api";
import { githubProfileUrl } from "@/lib/github/parse-username";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  GitBranch,
  GitCommit,
  GitPullRequest,
  RefreshCw,
  Star,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";

function eventIcon(type: string): LucideIcon {
  if (type === "PushEvent") return GitCommit;
  if (type === "PullRequestEvent") return GitPullRequest;
  if (type === "WatchEvent") return Star;
  return GitBranch;
}

function relativeTime(
  formatter: ReturnType<typeof useFormatter>,
  iso: string,
): string {
  return formatter.relativeTime(new Date(iso), new Date());
}

export function GitHubActivityCard({ username }: { username: string }) {
  const t = useTranslations("Profile.github");
  const formatter = useFormatter();
  const activity = useGithubActivity(username);
  const profileUrl = githubProfileUrl(username);

  return (
    <section className="border-b border-border bg-card px-5 py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GitBranch className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{t("title")}</h3>
        </div>
        <div className="flex items-center gap-2">
          {activity.data?.fetchedAt ? (
            <span className="text-xs text-muted-foreground">
              {t("updated", {
                time: relativeTime(formatter, activity.data.fetchedAt),
              })}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => activity.refetch()}
            disabled={activity.isFetching}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label={t("refresh")}
          >
            <RefreshCw
              className={cn("size-4", activity.isFetching && "animate-spin")}
            />
          </button>
        </div>
      </div>

      <QueryState
        isLoading={activity.isLoading}
        isError={activity.isError}
        error={activity.error}
        loadingMessage={t("loading")}
        onRetry={() => activity.refetch()}
      >
        {activity.data ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
              <img
                src={activity.data.profile.avatarUrl}
                alt=""
                className="size-12 rounded-full border border-border"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                  >
                    @{activity.data.profile.login}
                  </a>
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={t("openProfile")}
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
                {activity.data.profile.name ? (
                  <p className="text-sm text-muted-foreground">
                    {activity.data.profile.name}
                  </p>
                ) : null}
                {activity.data.profile.bio ? (
                  <p className="mt-1 text-sm leading-relaxed">
                    {activity.data.profile.bio}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>
                    {t("repos", { count: activity.data.profile.publicRepos })}
                  </span>
                  <span>
                    {t("followers", { count: activity.data.profile.followers })}
                  </span>
                  <span>
                    {t("following", { count: activity.data.profile.following })}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("recentActivity")}
              </h4>
              {activity.data.events.length > 0 ? (
                <ul className="space-y-2">
                  {activity.data.events.map((event) => {
                    const Icon = eventIcon(event.type);
                    return (
                      <li
                        key={event.id}
                        className="flex gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
                      >
                        <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug">{event.summary}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <a
                              href={event.repoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="truncate hover:underline"
                            >
                              {event.repoName}
                            </a>
                            <span aria-hidden>·</span>
                            <time dateTime={event.createdAt}>
                              {relativeTime(formatter, event.createdAt)}
                            </time>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t("noActivity")}</p>
              )}
            </div>
          </div>
        ) : null}
      </QueryState>
    </section>
  );
}
