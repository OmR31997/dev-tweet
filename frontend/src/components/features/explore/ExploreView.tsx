"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { UserRow } from "@/components/common/UserRow";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/features/feed";
import { useCommentsPanel } from "@/components/features/feed/use-comments-panel";
import { usePosts, useUsers } from "@/lib/api";
import { useDebouncedValue } from "@/lib/use-debounce";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function ExploreView() {
  const t = useTranslations("Explore");
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const q = useDebouncedValue(query.trim(), 300, { flushOnEmpty: true });

  const users = useUsers(q || undefined);
  const posts = usePosts(q || undefined);
  const commentsPanel = useCommentsPanel();

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      <PageHeader title={t("title")} />

      <div className="border-b border-border bg-card px-5 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-10 pl-9"
          />
        </div>
      </div>

      {users.data && users.data.length > 0 ? (
        <section>
          <h2 className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("people")}
          </h2>
          <div className="divide-y divide-border">
            {users.data.slice(0, 8).map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {q ? t("matchingPosts") : t("recentPosts")}
        </h2>
        {posts.isLoading ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">{t("searching")}</p>
        ) : posts.data && posts.data.length > 0 ? (
          posts.data.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              commentsOpen={commentsPanel.isOpen(post.id)}
              onToggleComments={() => commentsPanel.toggle(post.id)}
            />
          ))
        ) : (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            {t("noPostsFound")}
          </p>
        )}
      </section>
    </div>
  );
}
