"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { PageLayout } from "@/components/common/PageLayout";
import { QueryState } from "@/components/common/QueryState";
import { usePosts } from "@/lib/api";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { FeedFloatingAction } from "./FeedFloatingAction";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";
import { useCommentsPanel } from "./use-comments-panel";

export function FeedView() {
  const t = useTranslations("Feed");
  const posts = usePosts();
  const commentsPanel = useCommentsPanel();
  const composerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <PageLayout header={<PageHeader title={t("title")} />}>
        <PostComposer composerRef={composerRef} />

        <QueryState
          isLoading={posts.isLoading}
          isError={posts.isError}
          error={posts.error}
          isEmpty={(posts.data?.length ?? 0) === 0}
          loadingMessage={t("loadingFeed")}
          emptyMessage={t("emptyFeed")}
          onRetry={() => posts.refetch()}
        >
          <div>
            {posts.data?.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                commentsOpen={commentsPanel.isOpen(post.id)}
                onToggleComments={() => commentsPanel.toggle(post.id)}
              />
            ))}
          </div>
        </QueryState>
      </PageLayout>

      <FeedFloatingAction composerRef={composerRef} />
    </div>
  );
}
