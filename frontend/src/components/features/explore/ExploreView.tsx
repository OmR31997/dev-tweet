"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { UserRow } from "@/components/common/UserRow";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/features/feed";
import { usePosts, useUsers } from "@/lib/api";
import { useDebouncedValue } from "@/lib/use-debounce";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function ExploreView() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const q = useDebouncedValue(query.trim(), 300);

  const users = useUsers(q || undefined);
  const posts = usePosts(q || undefined);

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      <PageHeader title="Explore" />

      <div className="border-b border-border bg-card px-5 py-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people and posts…"
            className="h-10 pl-9"
          />
        </div>
      </div>

      {users.data && users.data.length > 0 ? (
        <section>
          <h2 className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            People
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
          {q ? "Matching posts" : "Recent posts"}
        </h2>
        {posts.isLoading ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">Searching…</p>
        ) : posts.data && posts.data.length > 0 ? (
          posts.data.map((post) => <PostCard key={post.id} post={post} />)
        ) : (
          <p className="px-5 py-6 text-sm text-muted-foreground">
            No posts found.
          </p>
        )}
      </section>
    </div>
  );
}
