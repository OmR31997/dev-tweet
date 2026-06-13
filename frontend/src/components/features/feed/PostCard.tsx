"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  resolveImageUrl,
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
  MoreHorizontal,
  Pencil,
  Repeat2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CommentsSection } from "./CommentsSection";
import { EditPostDialog } from "./EditPostDialog";
import { PostContent } from "./PostContent";

export function PostCard({ post }: { post: Post }) {
  const me = useAuthUser();
  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const deletePost = useDeletePost();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const liked = me ? post.likes.includes(me.id) : false;
  const reposted = me ? post.reposts.includes(me.id) : false;
  const isRepost = Boolean(post.repostOf);
  const canManage = me?.id === post.authorId && !isRepost;

  return (
    <article className="border-b border-border bg-card">
      {isRepost && post.repostedByName ? (
        <div className="flex items-center gap-1.5 px-5 pt-3 text-xs font-medium text-muted-foreground">
          <Repeat2 className="size-3.5" />
          {post.repostedById === me?.id ? (
            <span>You reposted</span>
          ) : (
            <span>
              <Link
                href={`/profile/${post.repostedById}`}
                className="font-semibold hover:underline"
              >
                {post.repostedByName}
              </Link>{" "}
              reposted
            </span>
          )}
          {post.repostedById === me?.id ? (
            <button
              type="button"
              onClick={() => toggleRepost.mutate(post.id)}
              disabled={toggleRepost.isPending}
              className="ml-auto flex items-center gap-1 text-muted-foreground transition-colors hover:text-destructive"
              aria-label="Remove repost"
            >
              <Trash2 className="size-3.5" />
              Remove
            </button>
          ) : null}
        </div>
      ) : null}

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
              <div className="relative ml-auto">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Post options"
                  className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <MoreHorizontal className="size-5" />
                </button>
                {menuOpen ? (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-1 w-40 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setEditing(true);
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        <Pencil className="size-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmOpen(true);
                        }}
                        className="flex w-full items-center gap-3 border-t border-border px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-accent"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-1">
            <PostContent content={post.content} />
          </div>

          {post.imageIds.length > 0 ? (
            <div
              className={cn(
                "mt-3 grid gap-2 overflow-hidden rounded-xl",
                post.imageIds.length === 1 ? "grid-cols-1" : "grid-cols-2"
              )}
            >
              {post.imageIds.map((id) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={id}
                  src={resolveImageUrl(id)}
                  alt=""
                  className="max-h-96 w-full rounded-xl border border-border object-cover"
                />
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex items-center gap-6 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => toggleLike.mutate(post.id)}
              disabled={toggleLike.isPending}
              className={cn(
                "flex items-center gap-1.5 transition-colors hover:text-destructive",
                liked && "text-destructive"
              )}
            >
              <Heart className={cn("size-4", liked && "fill-current")} />
              {post.likes.length > 0 ? post.likes.length : null}
            </button>

            <button
              type="button"
              onClick={() => setShowComments((s) => !s)}
              className={cn(
                "flex items-center gap-1.5 transition-colors hover:text-primary",
                showComments && "text-primary"
              )}
            >
              <MessageCircle className="size-4" />
              {post.commentCount > 0 ? post.commentCount : "Comment"}
            </button>

            <button
              type="button"
              onClick={() => toggleRepost.mutate(post.id)}
              disabled={toggleRepost.isPending}
              className={cn(
                "flex items-center gap-1.5 transition-colors hover:text-green-600",
                reposted && "text-green-600"
              )}
            >
              <Repeat2 className="size-4" />
              {post.reposts.length > 0 ? post.reposts.length : "Repost"}
            </button>
          </div>
        </div>
      </div>

      {showComments ? <CommentsSection post={post} /> : null}

      <EditPostDialog
        post={post}
        open={editing}
        onClose={() => setEditing(false)}
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
