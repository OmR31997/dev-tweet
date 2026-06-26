"use client";

import { PAGE_GUTTER } from "@/components/common/PageLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLayout } from "@/components/common/PageLayout";
import { QueryState } from "@/components/common/QueryState";
import { UserAvatar } from "@/components/common/UserAvatar";
import { FollowButton } from "@/components/common/FollowButton";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/features/feed";
import { useCommentsPanel } from "@/components/features/feed/use-comments-panel";
import {
  usePosts,
  useUser,
  type AuthUser,
} from "@/lib/api";
import { getFollowRelationship } from "@/lib/follow.utils";
import { githubProfileUrl } from "@/lib/github/parse-username";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import { GitBranch, MessageCircle, Settings } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { EditProfileDialog } from "./EditProfileDialog";
import { FollowListDialog, type FollowListTab } from "./FollowListDialog";
import { GitHubActivityCard } from "./GitHubActivityCard";

const PROFILE_POSTS_PREVIEW = 5;

function Stat({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="font-semibold">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </>
  );

  if (!onClick) {
    return <div className="flex items-baseline gap-1">{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-baseline gap-1 rounded-md transition-colors hover:text-primary"
    >
      {content}
    </button>
  );
}

function ProfileFollowsYouBadge({
  meId,
  user,
}: {
  meId: string;
  user: AuthUser;
}) {
  const { followsYou, isFollowing } = getFollowRelationship(meId, user);
  if (!followsYou || isFollowing) return null;
  return <p className="text-sm text-muted-foreground">Follows you</p>;
}

function ProfileHeaderActions({ user }: { user: AuthUser }) {
  const me = useAuthUser();
  const [editing, setEditing] = useState(false);

  if (me?.id === user.id) {
    return (
      <div className="flex w-full flex-wrap justify-stretch gap-2 sm:w-auto sm:justify-end">
        <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setEditing(true)}>
          Edit profile
        </Button>
        <Button variant="outline" size="icon" className="shrink-0" asChild aria-label="Settings">
          <Link href="/settings">
            <Settings className="size-4" />
          </Link>
        </Button>
        <EditProfileDialog
          user={user}
          open={editing}
          onClose={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
      <FollowButton target={user} size="default" className="flex-1 sm:flex-none" />
      <Button variant="outline" className="flex-1 sm:flex-none" asChild>
        <Link href={`/messages/${user.id}`}>
          <MessageCircle className="size-4" />
          Message
        </Link>
      </Button>
    </div>
  );
}

export function ProfileView({ userId }: { userId: string }) {
  const t = useTranslations("Profile");
  const me = useAuthUser();
  const userQuery = useUser(userId);
  const postsQuery = usePosts(undefined, 50, { poll: false });
  const user = userQuery.data;
  const [followListOpen, setFollowListOpen] = useState(false);
  const [followListTab, setFollowListTab] = useState<FollowListTab>("followers");
  const [showAllPosts, setShowAllPosts] = useState(false);
  const commentsPanel = useCommentsPanel();

  useEffect(() => {
    setShowAllPosts(false);
  }, [userId]);

  const openFollowList = (tab: FollowListTab) => {
    setFollowListTab(tab);
    setFollowListOpen(true);
  };

  const userPosts =
    postsQuery.data?.filter(
      (p) =>
        (p.authorId === userId && !p.repostOf) || p.repostedById === userId,
    ) ?? [];

  const visiblePosts = showAllPosts
    ? userPosts
    : userPosts.slice(0, PROFILE_POSTS_PREVIEW);
  const hasMorePosts = userPosts.length > PROFILE_POSTS_PREVIEW;

  const meta = user
    ? [user.branch, user.college, user.year].filter(Boolean).join(" · ")
    : "";

  const headerTitle =
    user?.displayName ?? (me?.id === userId ? me.displayName : "Profile");

  const header = useMemo(
    () => <PageHeader title={headerTitle} />,
    [headerTitle],
  );

  const showProfileLoading = userQuery.isPending;

  return (
    <PageLayout header={header}>
      <QueryState
        isLoading={showProfileLoading}
        isError={userQuery.isError}
        error={userQuery.error}
        loadingMessage="Loading profile…"
        onRetry={() => userQuery.refetch()}
      >
        {user ? (
          <>
            <div className={cn("border-b border-border bg-card py-5 sm:py-6", PAGE_GUTTER)}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <UserAvatar
                  name={user.displayName}
                  photoURL={user.photoURL}
                  className="size-20 text-lg"
                />
                <ProfileHeaderActions user={user} />
              </div>

              <h2 className="mt-4 text-xl font-bold">{user.displayName}</h2>
              {me && me.id !== user.id ? (
                <ProfileFollowsYouBadge meId={me.id} user={user} />
              ) : null}
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {meta ? (
                <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
              ) : null}
              {user.bio ? (
                <p className="mt-3 text-[15px] leading-relaxed">{user.bio}</p>
              ) : null}
              {user.githubUsername ? (
                <a
                  href={githubProfileUrl(user.githubUsername)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <GitBranch className="size-4" />
                  @{user.githubUsername}
                </a>
              ) : null}

              <div className="mt-4 flex gap-5">
                <Stat
                  label="following"
                  value={user.following?.length ?? 0}
                  onClick={() => openFollowList("following")}
                />
                <Stat
                  label="followers"
                  value={user.followers?.length ?? 0}
                  onClick={() => openFollowList("followers")}
                />
              </div>

              <FollowListDialog
                open={followListOpen}
                onClose={() => setFollowListOpen(false)}
                userId={user.id}
                displayName={user.displayName}
                tab={followListTab}
                followerCount={user.followers?.length ?? 0}
                followingCount={user.following?.length ?? 0}
              />
            </div>

            {user.githubUsername ? (
              <GitHubActivityCard username={user.githubUsername} />
            ) : null}

            <h3 className={cn("pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground", PAGE_GUTTER)}>
              {t("posts")}
            </h3>
            {userPosts.length > 0 ? (
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
                  <div className={cn("border-b border-border py-3", PAGE_GUTTER)}>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowAllPosts((open) => !open)}
                    >
                      {showAllPosts ? t("showLess") : t("viewAll")}
                    </Button>
                  </div>
                ) : null}
              </>
            ) : (
              <p className={cn("py-6 text-sm text-muted-foreground", PAGE_GUTTER)}>
                {t("noPosts")}
              </p>
            )}
          </>
        ) : null}
      </QueryState>
    </PageLayout>
  );
}
