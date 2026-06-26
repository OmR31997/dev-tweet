"use client";

import { FollowButton } from "@/components/common/FollowButton";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLayout } from "@/components/common/PageLayout";
import { UserRow } from "@/components/common/UserRow";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/features/feed";
import { useCommentsPanel } from "@/components/features/feed/use-comments-panel";
import { usePosts, useUsers } from "@/lib/api";
import { useDebouncedValue } from "@/lib/use-debounce";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const EXPLORE_PREVIEW_COUNT = 5;

export function ExploreView() {
  const t = useTranslations("Explore");
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [showAllPeople, setShowAllPeople] = useState(false);
  const q = useDebouncedValue(query.trim(), 300, { flushOnEmpty: true });

  const users = useUsers(q || undefined);
  const posts = usePosts(q || undefined, EXPLORE_PREVIEW_COUNT + 1, { poll: false });
  const commentsPanel = useCommentsPanel();

  useEffect(() => {
    setShowAllPeople(false);
  }, [q]);

  const allUsers = users.data ?? [];
  const visibleUsers = showAllPeople
    ? allUsers
    : allUsers.slice(0, EXPLORE_PREVIEW_COUNT);
  const hasMorePeople = allUsers.length > EXPLORE_PREVIEW_COUNT;

  const allPosts = posts.data ?? [];
  const visiblePosts = allPosts.slice(0, EXPLORE_PREVIEW_COUNT);
  const hasMorePosts = allPosts.length > EXPLORE_PREVIEW_COUNT;

  return (
    <PageLayout header={<PageHeader title={t("title")} />}>
      <div className="border-b border-border bg-card px-5 py-4">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-10"
        />
      </div>

      {allUsers.length > 0 ? (
        <section>
          <h2 className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("people")}
          </h2>
          <div className="divide-y divide-border">
            {visibleUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                action={<FollowButton target={user} />}
              />
            ))}
          </div>
          {hasMorePeople ? (
            <div className="border-b border-border px-5 py-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowAllPeople((open) => !open)}
              >
                {showAllPeople ? t("showLess") : t("viewAll")}
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      <section>
        <h2 className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {q ? t("matchingPosts") : t("recentPosts")}
        </h2>
        {posts.isLoading ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">{t("searching")}</p>
        ) : visiblePosts.length > 0 ? (
          <>
            {visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                commentsOpen={commentsPanel.isOpen(post.id)}
                onToggleComments={() => commentsPanel.toggle(post.id)}
              />
            ))}
            {hasMorePosts ? (
              <div className="border-b border-border px-5 py-3">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/feed">{t("viewAll")}</Link>
                </Button>
              </div>
            ) : null}
          </>
        ) : (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            {t("noPostsFound")}
          </p>
        )}
      </section>
    </PageLayout>
  );
}
