"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { usePosts } from "@/lib/api";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";

export function FeedView() {
  const posts = usePosts();

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      <PageHeader title="Feed" />
      <PostComposer />

      <QueryState
        isLoading={posts.isLoading}
        isError={posts.isError}
        error={posts.error}
        isEmpty={(posts.data?.length ?? 0) === 0}
        loadingMessage="Loading feed…"
        emptyMessage="No posts yet — be the first to share something."
        onRetry={() => posts.refetch()}
      >
        <div>
          {posts.data?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </QueryState>
    </div>
  );
}
