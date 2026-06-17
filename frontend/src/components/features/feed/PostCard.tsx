"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { OptionsMenu } from "@/components/common/OptionsMenu";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  useDeletePost,
  useToggleLike,
  useToggleRepost,
  type Post,
} from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import {
  Heart,
  MessageCircle,
  Pencil,
  Repeat2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CommentsSection } from "./CommentsSection";
import { EditPostDialog } from "./EditPostDialog";
import { PostContent } from "./PostContent";
import { PostMedia } from "./PostMedia";
import { RepostDialog } from "./RepostDialog";

function PostActions({
  post,
  liked,
  reposted,
  showComments,
  onToggleLike,
  onToggleComments,
  onRepostClick,
  likePending,
  repostPending,
}: {
  post: Post;
  liked: boolean;
  reposted: boolean;
  showComments: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onRepostClick: () => void;
  likePending: boolean;
  repostPending: boolean;
}) {
  return (
    <div className="mt-3 flex items-center gap-6 text-sm text-muted-foreground">
      <button
        type="button"
        onClick={onToggleLike}
        disabled={likePending}
        className={cn(
          "flex items-center gap-1.5 transition-colors hover:text-destructive",
          liked && "text-destructive",
        )}
      >
        <Heart className={cn("size-4", liked && "fill-current")} />
        {post.likes.length > 0 ? post.likes.length : null}
      </button>

      <button
        type="button"
        onClick={onToggleComments}
        className={cn(
          "flex items-center gap-1.5 transition-colors hover:text-primary",
          showComments && "text-primary",
        )}
      >
        <MessageCircle className="size-4" />
        {post.commentCount > 0 ? post.commentCount : "Comment"}
      </button>

      <button
        type="button"
        onClick={onRepostClick}
        disabled={repostPending}
        className={cn(
          "flex items-center gap-1.5 transition-colors hover:text-green-600",
          reposted && "text-green-600",
        )}
      >
        <Repeat2 className="size-4" />
        {post.reposts.length > 0 ? post.reposts.length : "Repost"}
      </button>
    </div>
  );
}

export function PostCard({
  post,
  commentsOpen,
  onToggleComments,
}: {
  post: Post;
  commentsOpen: boolean;
  onToggleComments: () => void;
}) {
  const me = useAuthUser();
  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const deletePost = useDeletePost();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [repostDialogOpen, setRepostDialogOpen] = useState(false);

  const liked = me ? post.likes.includes(me.id) : false;
  const isRepost = Boolean(post.repostOf);
  const reposted = me
    ? post.reposts.includes(me.id) ||
      (isRepost && post.repostedById === me.id)
    : false;
  const canManage = me?.id === post.authorId && !isRepost;
  const isOwnRepost = isRepost && post.repostedById === me?.id;

  const handleRepostClick = () => {
    if (reposted) {
      toggleRepost.mutate({ id: post.id });
      return;
    }
    setRepostDialogOpen(true);
  };

  if (isRepost) {
    const reposterId = post.repostedById ?? "";
    const reposterName =
      post.repostedById === me?.id
        ? "You"
        : post.repostedByName || "User";
    const reposterPhoto =
      post.repostedByPhoto ||
      (post.repostedById === me?.id ? me?.photoURL : undefined);

    return (
      <article
        className="border-b border-border bg-card"
        data-post-comments={post.id}
      >
        <div className="flex gap-3 px-5 py-4">
          {reposterId ? (
            <Link href={`/profile/${reposterId}`} className="shrink-0">
              <UserAvatar
                name={post.repostedByName || reposterName}
                photoURL={reposterPhoto}
              />
            </Link>
          ) : (
            <UserAvatar
              name={post.repostedByName || reposterName}
              photoURL={reposterPhoto}
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {reposterId ? (
                <Link
                  href={`/profile/${reposterId}`}
                  className="truncate font-semibold hover:underline"
                >
                  {reposterName}
                </Link>
              ) : (
                <span className="truncate font-semibold">{reposterName}</span>
              )}
              <span className="text-sm text-muted-foreground">
                · {timeAgo(post.createdAt)}
              </span>

              {isOwnRepost ? (
                <OptionsMenu
                  open={menuOpen}
                  onToggle={() => setMenuOpen((o) => !o)}
                  onClose={() => setMenuOpen(false)}
                  items={[
                    {
                      label: "Remove repost",
                      icon: <Trash2 className="size-4" />,
                      destructive: true,
                      onClick: () => {
                        setMenuOpen(false);
                        toggleRepost.mutate({ id: post.id });
                      },
                    },
                  ]}
                />
              ) : null}
            </div>

            {post.repostCaption ? (
              <div className="mt-1">
                <PostContent content={post.repostCaption} />
              </div>
            ) : null}

            <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/30">
              <div className="flex gap-2.5 p-3">
                <Link href={`/profile/${post.authorId}`} className="shrink-0">
                  <UserAvatar
                    name={post.authorName}
                    photoURL={post.authorPhoto}
                    className="size-9"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${post.authorId}`}
                      className="truncate text-sm font-semibold hover:underline"
                    >
                      {post.authorName}
                    </Link>
                  </div>
                  <PostContent content={post.content} />
                  <PostMedia post={post} compact />
                </div>
              </div>
            </div>

            <PostActions
              post={post}
              liked={liked}
              reposted={reposted}
              showComments={commentsOpen}
              likePending={toggleLike.isPending}
              repostPending={toggleRepost.isPending}
              onToggleLike={() => toggleLike.mutate(post.id)}
              onToggleComments={onToggleComments}
              onRepostClick={handleRepostClick}
            />
          </div>
        </div>

        {commentsOpen ? <CommentsSection post={post} /> : null}

        <RepostDialog
          post={post}
          open={repostDialogOpen}
          onClose={() => setRepostDialogOpen(false)}
        />
      </article>
    );
  }

  return (
    <article
      className="border-b border-border bg-card"
      data-post-comments={post.id}
    >
      <div className="flex gap-3 px-5 py-4">
        <Link href={`/profile/${post.authorId}`} className="shrink-0">
          <UserAvatar name={post.authorName} photoURL={post.authorPhoto} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${post.authorId}`}
              className="truncate font-semibold hover:underline"
            >
              {post.authorName}
            </Link>
            <span className="text-sm text-muted-foreground">
              · {timeAgo(post.createdAt)}
            </span>

            {canManage ? (
              <OptionsMenu
                open={menuOpen}
                onToggle={() => setMenuOpen((o) => !o)}
                onClose={() => setMenuOpen(false)}
                items={[
                  {
                    label: "Edit",
                    icon: <Pencil className="size-4" />,
                    onClick: () => {
                      setMenuOpen(false);
                      setEditing(true);
                    },
                  },
                  {
                    label: "Delete",
                    icon: <Trash2 className="size-4" />,
                    destructive: true,
                    onClick: () => {
                      setMenuOpen(false);
                      setConfirmOpen(true);
                    },
                  },
                ]}
              />
            ) : null}
          </div>

          <div className="mt-1">
            <PostContent content={post.content} />
          </div>

          <PostMedia post={post} />

          <PostActions
            post={post}
            liked={liked}
            reposted={reposted}
            showComments={commentsOpen}
            likePending={toggleLike.isPending}
            repostPending={toggleRepost.isPending}
            onToggleLike={() => toggleLike.mutate(post.id)}
            onToggleComments={onToggleComments}
            onRepostClick={handleRepostClick}
          />
        </div>
      </div>

      {commentsOpen ? <CommentsSection post={post} /> : null}

      <EditPostDialog
        post={post}
        open={editing}
        onClose={() => setEditing(false)}
      />

      <RepostDialog
        post={post}
        open={repostDialogOpen}
        onClose={() => setRepostDialogOpen(false)}
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Delete post?"
        message="This can't be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        busy={deletePost.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          deletePost.mutate(post.id, { onSettled: () => setConfirmOpen(false) })
        }
      />
    </article>
  );
}
