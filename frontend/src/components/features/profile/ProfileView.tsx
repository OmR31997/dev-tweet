"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/features/feed";
import {
  usePosts,
  useToggleFollow,
  useUser,
  type AuthUser,
} from "@/lib/api";
import { useAuthUser } from "@/store";
import { MessageCircle, Settings } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EditProfileDialog } from "./EditProfileDialog";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="font-semibold">{value}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function ProfileHeaderActions({ user }: { user: AuthUser }) {
  const me = useAuthUser();
  const toggleFollow = useToggleFollow();
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

  const isFollowing = me ? (user.followers ?? []).includes(me.id) : false;

  return (
    <div className="flex gap-2">
      <Button
        variant={isFollowing ? "outline" : "default"}
        onClick={() => toggleFollow.mutate(user.id)}
        disabled={toggleFollow.isPending}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
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
  const userQuery = useUser(userId);
  const postsQuery = usePosts();
  const user = userQuery.data;

  const userPosts =
    postsQuery.data?.filter((p) => p.authorId === userId) ?? [];

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
              <p className="text-sm text-muted-foreground">{user.email}</p>
              {meta ? (
                <p className="mt-1 text-sm text-muted-foreground">{meta}</p>
              ) : null}
              {user.bio ? (
                <p className="mt-3 text-[15px] leading-relaxed">{user.bio}</p>
              ) : null}

              <div className="mt-4 flex gap-5">
                <Stat label="following" value={user.following?.length ?? 0} />
                <Stat label="followers" value={user.followers?.length ?? 0} />
              </div>
            </div>

            <h3 className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Posts
            </h3>
            {userPosts.length > 0 ? (
              userPosts.map((post) => <PostCard key={post.id} post={post} />)
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
