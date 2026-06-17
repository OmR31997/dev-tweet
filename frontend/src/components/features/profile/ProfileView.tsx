"use client";

import { PageHeader } from "@/components/common/PageHeader";
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
import { useAuthUser } from "@/store";
import { GitBranch, MessageCircle, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EditProfileDialog } from "./EditProfileDialog";
import { FollowListDialog, type FollowListTab } from "./FollowListDialog";
import { GitHubActivityCard } from "./GitHubActivityCard";

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
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setEditing(true)}>
          Edit profile
        </Button>
        <Button variant="outline" size="icon" asChild aria-label="Settings">
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
    <div className="flex gap-2">
      <FollowButton target={user} size="default" />
      <Button variant="outline" asChild>
        <Link href={`/messages/${user.id}`}>
          <MessageCircle className="size-4" />
          Message
        </Link>
      </Button>
    </div>
  );
}

export function ProfileView({ userId }: { userId: string }) {
  const me = useAuthUser();
  const userQuery = useUser(userId);
  const postsQuery = usePosts(undefined, 50, { poll: false });
  const user = userQuery.data;
  const [followListOpen, setFollowListOpen] = useState(false);
  const [followListTab, setFollowListTab] = useState<FollowListTab>("followers");
  const commentsPanel = useCommentsPanel();

  const openFollowList = (tab: FollowListTab) => {
    setFollowListTab(tab);
    setFollowListOpen(true);
  };

  const userPosts =
    postsQuery.data?.filter(
      (p) =>
        (p.authorId === userId && !p.repostOf) || p.repostedById === userId,
    ) ?? [];

  const meta = user
    ? [user.branch, user.college, user.year].filter(Boolean).join(" · ")
    : "";

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      <PageHeader title={user?.displayName ?? "Profile"} />

      <QueryState
        isLoading={userQuery.isLoading}
        isError={userQuery.isError}
        error={userQuery.error}
        loadingMessage="Loading profile…"
        onRetry={() => userQuery.refetch()}
      >
        {user ? (
          <>
            <div className="border-b border-border bg-card px-5 py-6">
              <div className="flex items-start justify-between gap-4">
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

            <h3 className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Posts
            </h3>
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  commentsOpen={commentsPanel.isOpen(post.id)}
                  onToggleComments={() => commentsPanel.toggle(post.id)}
                />
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                No posts yet.
              </p>
            )}
          </>
        ) : null}
      </QueryState>
    </div>
  );
}
