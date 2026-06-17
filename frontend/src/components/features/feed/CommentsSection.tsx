"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { OptionsMenu } from "@/components/common/OptionsMenu";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAddComment,
  useComments,
  useDeleteComment,
  useToggleCommentLike,
  type Comment,
  type Post,
} from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface RowProps {
  comment: Comment;
  postAuthorId: string;
  replies: Comment[];
  onReply: (parentId: string, content: string) => void;
  openMenuId: string | null;
  onMenuOpen: (id: string | null) => void;
  openReplyId: string | null;
  onReplyOpen: (id: string | null) => void;
  isReply?: boolean;
}

function CommentRow({
  comment,
  postAuthorId,
  replies,
  onReply,
  openMenuId,
  onMenuOpen,
  openReplyId,
  onReplyOpen,
  isReply = false,
}: RowProps) {
  const me = useAuthUser();
  const toggleLike = useToggleCommentLike(comment.postId);
  const deleteComment = useDeleteComment(comment.postId);

  const [replyDraft, setReplyDraft] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const liked = me ? comment.likes.includes(me.id) : false;
  const canDelete = me?.id === comment.authorId || me?.id === postAuthorId;
  const menuOpen = openMenuId === comment.id;
  const replying = openReplyId === comment.id;

  const submitReply = (e: React.FormEvent) => {
    e.preventDefault();
    const content = replyDraft.trim();
    if (!content) return;
    onReply(comment.id, content);
    setReplyDraft("");
    onReplyOpen(null);
  };

  return (
    <li className="flex gap-2.5">
      <Link href={`/profile/${comment.authorId}`} className="shrink-0">
        <UserAvatar
          name={comment.authorName}
          photoURL={comment.authorPhoto}
          className={isReply ? "size-7" : "size-8"}
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="rounded-2xl bg-card px-3 py-2">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${comment.authorId}`}
              className="truncate text-sm font-semibold hover:underline"
            >
              {comment.authorName}
            </Link>
            <span className="text-xs text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
            {canDelete ? (
              <OptionsMenu
                open={menuOpen}
                onToggle={() => {
                  onMenuOpen(menuOpen ? null : comment.id);
                  if (!menuOpen) onReplyOpen(null);
                }}
                onClose={() => onMenuOpen(null)}
                ariaLabel="Comment options"
                items={[
                  {
                    label: "Delete",
                    icon: <Trash2 className="size-4" />,
                    destructive: true,
                    onClick: () => {
                      onMenuOpen(null);
                      setConfirmOpen(true);
                    },
                  },
                ]}
              />
            ) : null}
          </div>
          <p className="whitespace-pre-wrap break-words text-sm">
            {comment.content}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-4 pl-3 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => toggleLike.mutate(comment.id)}
            className={cn(
              "flex items-center gap-1 transition-colors hover:text-destructive",
              liked && "text-destructive",
            )}
          >
            <Heart className={cn("size-3.5", liked && "fill-current")} />
            {comment.likes.length > 0 ? comment.likes.length : "Like"}
          </button>
          {!isReply ? (
            <button
              type="button"
              onClick={() => {
                onReplyOpen(replying ? null : comment.id);
                if (!replying) onMenuOpen(null);
              }}
              className="font-medium transition-colors hover:text-foreground"
            >
              Reply
            </button>
          ) : null}
        </div>

        {replying ? (
          <form onSubmit={submitReply} className="mt-2 flex items-center gap-2">
            <Input
              autoFocus
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              placeholder={`Reply to ${comment.authorName}…`}
              className="h-8"
            />
            <Button type="submit" size="sm" disabled={!replyDraft.trim()}>
              Reply
            </Button>
          </form>
        ) : null}

        {replies.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {replies.map((r) => (
              <CommentRow
                key={r.id}
                comment={r}
                postAuthorId={postAuthorId}
                replies={[]}
                onReply={onReply}
                openMenuId={openMenuId}
                onMenuOpen={onMenuOpen}
                openReplyId={openReplyId}
                onReplyOpen={onReplyOpen}
                isReply
              />
            ))}
          </ul>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete comment?"
        message="This can't be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        busy={deleteComment.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          deleteComment.mutate(comment.id, {
            onSettled: () => setConfirmOpen(false),
          })
        }
      />
    </li>
  );
}

export function CommentsSection({ post }: { post: Post }) {
  const me = useAuthUser();
  const comments = useComments(post.id);
  const addComment = useAddComment(post.id);
  const [draft, setDraft] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);

  const all = comments.data ?? [];
  const topLevel = all.filter((c) => !c.parentId);
  const repliesOf = (id: string) => all.filter((c) => c.parentId === id);

  const onReply = (parentId: string, content: string) =>
    addComment.mutate({ content, parentId });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    addComment.mutate({ content }, { onSuccess: () => setDraft("") });
  };

  return (
    <div className="border-t border-border bg-muted/20 px-5 py-3">
      <form onSubmit={onSubmit} className="mb-3 flex items-center gap-2">
        <UserAvatar
          name={me?.displayName}
          photoURL={me?.photoURL}
          className="size-8"
        />
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a comment…"
          className="h-9"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!draft.trim() || addComment.isPending}
        >
          Post
        </Button>
      </form>

      {comments.isLoading ? (
        <p className="py-2 text-sm text-muted-foreground">Loading comments…</p>
      ) : topLevel.length > 0 ? (
        <ul className="space-y-4">
          {topLevel.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              postAuthorId={post.authorId}
              replies={repliesOf(c.id)}
              onReply={onReply}
              openMenuId={openMenuId}
              onMenuOpen={setOpenMenuId}
              openReplyId={openReplyId}
              onReplyOpen={setOpenReplyId}
            />
          ))}
        </ul>
      ) : (
        <p className="py-2 text-sm text-muted-foreground">
          No comments yet. Be the first.
        </p>
      )}
    </div>
  );
}
