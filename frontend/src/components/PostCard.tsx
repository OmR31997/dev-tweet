import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post, Comment } from '../types';
import { auth, handleFirestoreError, OperationType, toggleLike, getApiBaseUrl, deletePostById } from '../apiClient';
import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, Send, X, Edit2, Save, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PostMarkdown from './ui/PostMarkdown';
import Avatar from './ui/Avatar';

export default function PostCard({
  post,
  onAuthorClick,
  onDeleteSuccess,
}: {
  post: Post;
  /** Open user profile (Twitter-style). */
  onAuthorClick?: (authorId: string) => void;
  onDeleteSuccess?: (postId: string) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [likedPulse, setLikedPulse] = useState(false);
  const [localLikes, setLocalLikes] = useState<string[]>(post.likes || []);
  const [authorImageFailed, setAuthorImageFailed] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const isLiked = localLikes?.includes(auth.currentUser?.uid || '');
  const isAuthor = post.authorId === auth.currentUser?.uid;

  const initials = post.authorName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';

  const showInitialsAvatar = !post.authorPhoto || authorImageFailed;

  useEffect(() => {
    if (!showComments) return;

    setComments([]);
    return () => undefined;
  }, [showComments, post.id]);

  const handleLike = async () => {
    if (!auth.currentUser) return;
    try {
      const newIsLiked = !isLiked;
      if (newIsLiked) {
        setLikedPulse(true);
        window.setTimeout(() => setLikedPulse(false), 450);
      }
      await toggleLike(post.id);
      setLocalLikes((prev) =>
        newIsLiked ? [...prev, auth.currentUser!.uid] : prev.filter((id) => id !== auth.currentUser?.uid)
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'posts/' + post.id);
    }
  };

  const handleDelete = async () => {
    if (!isAuthor || isDeletingPost) return;
    setIsDeletingPost(true);

    try {
      await deletePostById(post.id);
      setShowDeleteConfirm(false);
      onDeleteSuccess?.(post.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete post';
      window.alert(message);
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleUpdate = async () => {
    if (!isAuthor || !editContent.trim()) return;
    setIsSavingEdit(true);
    try {
      throw new Error('Edit post is not available in current backend API.');
      setIsEditing(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'posts/' + post.id);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !auth.currentUser) return;

    setIsSubmittingComment(true);
    try {
      throw new Error('Comments are not available in current backend API.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'comments');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="surface-feed-card mb-3 max-w-full overflow-hidden p-3 sm:mb-4 sm:p-5"
    >
      <div className="mb-3 flex min-w-0 justify-between gap-2 sm:mb-4">
        {onAuthorClick ? (
          <button
            type="button"
            onClick={() => onAuthorClick(post.authorId)}
            className="flex min-w-0 flex-1 gap-3 rounded-xl text-left outline-none ring-black/20 transition-colors hover:bg-primary/10 focus-visible:ring-2"
          >
            {showInitialsAvatar ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/12 bg-black/85 text-xs font-bold text-primary md:h-11 md:w-11 md:text-sm">
                {initials}
              </div>
            ) : (
              <img
                src={post.authorPhoto}
                alt={post.authorName}
                className="h-10 w-10 shrink-0 rounded-full border border-black/12 object-cover md:h-11 md:w-11"
                referrerPolicy="no-referrer"
                onError={() => setAuthorImageFailed(true)}
              />
            )}
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold sm:text-base">{post.authorName}</h3>
              <p className="text-xs text-muted">
                {(() => {
                  if (!post.createdAt) return 'Just now';
                  const date = new Date(post.createdAt as unknown as string);
                  return formatDistanceToNow(date) + ' ago';
                })()}
              </p>
            </div>
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 gap-3">
            {showInitialsAvatar ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/12 bg-black/85 text-xs font-bold text-primary md:h-11 md:w-11 md:text-sm">
                {initials}
              </div>
            ) : (
              <img
                src={post.authorPhoto}
                alt={post.authorName}
                className="h-10 w-10 shrink-0 rounded-full border border-black/12 object-cover md:h-11 md:w-11"
                referrerPolicy="no-referrer"
                onError={() => setAuthorImageFailed(true)}
              />
            )}
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold sm:text-base">{post.authorName}</h3>
              <p className="text-xs text-muted">
                {(() => {
                  if (!post.createdAt) return 'Just now';
                  const date = new Date(post.createdAt as unknown as string);
                  return formatDistanceToNow(date) + ' ago';
                })()}
              </p>
            </div>
          </div>
        )}
        <div className="flex shrink-0 items-center gap-0.5">
          {isAuthor && !isEditing && (
            <>
              <motion.button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-xl p-2 text-muted hover:bg-primary/15 hover:text-black"
                title="Edit"
                whileTap={{ scale: 0.92 }}
              >
                <Edit2 size={17} />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="rounded-xl p-2 text-muted hover:bg-black/5 hover:text-black"
                title="Delete"
                whileTap={{ scale: 0.92 }}
              >
                <Trash2 size={17} />
              </motion.button>
            </>
          )}
          {isEditing && (
            <motion.button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl p-2 text-muted hover:bg-black/5"
              whileTap={{ scale: 0.92 }}
            >
              <X size={17} />
            </motion.button>
          )}
          <button type="button" className="rounded-xl p-2 text-muted hover:bg-black/5">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="mb-4 space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="input-field min-h-[120px] resize-none text-base"
            placeholder="Edit post…"
          />
          <div className="flex justify-end gap-2">
            <motion.button type="button" onClick={() => setIsEditing(false)} className="btn-secondary px-4 py-2 text-sm" whileTap={{ scale: 0.98 }}>
              Cancel
            </motion.button>
            <motion.button
              type="button"
              onClick={handleUpdate}
              disabled={isSavingEdit || !editContent.trim()}
              className="btn-cta flex items-center gap-2 px-5 py-2 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save size={16} /> {isSavingEdit ? 'Saving…' : 'Save'}
            </motion.button>
          </div>
        </div>
      ) : (
        <>
          <PostMarkdown className="mb-4 text-base sm:text-[1.05rem]">{post.content}</PostMarkdown>
          {post.imageIds && post.imageIds.length > 0 && (
            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {post.imageIds.map((imageId) => (
                <img
                  key={imageId}
                  src={`${getApiBaseUrl()}/uploads/image/${imageId}`}
                  alt="Post attachment"
                  className="w-full rounded-xl border border-black/10 object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </>
      )}

      <div className="flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-black/10 pt-3 sm:gap-x-2 sm:pt-4">
        <motion.button
          type="button"
          onClick={handleLike}
          className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors ${
            isLiked ? 'text-black' : 'text-muted hover:bg-primary/15 hover:text-black'
          }`}
          whileTap={{ scale: 0.94 }}
          animate={likedPulse ? { scale: [1, 1.12, 1] } : {}}
          transition={{ duration: 0.35 }}
        >
          <Heart size={19} className={`shrink-0 ${isLiked ? 'text-primary' : ''}`} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={2} />
          <span className="font-medium tabular-nums">{localLikes?.length || 0}</span>
        </motion.button>
        <motion.button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors ${
            showComments
              ? 'bg-primary/25 text-black'
              : 'text-muted hover:bg-primary/15 hover:text-black'
          }`}
          whileTap={{ scale: 0.94 }}
        >
          <MessageCircle size={19} className="shrink-0" strokeWidth={2} />
          <span className="font-medium tabular-nums">{post.commentCount || 0}</span>
        </motion.button>
        <motion.button
          type="button"
          className="ml-auto flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm text-muted hover:bg-black/5 hover:text-black"
          whileTap={{ scale: 0.94 }}
        >
          <Share2 size={19} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-black/10 pt-4">
              <div className="mb-4 max-h-[280px] space-y-3 overflow-y-auto pr-1 sm:max-h-[320px]">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 sm:gap-3">
                    {onAuthorClick ? (
                      <button
                        type="button"
                        onClick={() => onAuthorClick(comment.authorId)}
                        className="h-8 w-8 shrink-0 rounded-full outline-none ring-black/20 focus-visible:ring-2"
                      >
                        <Avatar
                          name={comment.authorName}
                          src={comment.authorPhoto}
                          className="h-8 w-8 rounded-full border border-black/12"
                          initialsClassName="flex items-center justify-center rounded-full border border-black/12 bg-black/85 text-[10px] font-bold text-primary"
                        />
                      </button>
                    ) : (
                      <Avatar
                        name={comment.authorName}
                        src={comment.authorPhoto}
                        className="h-8 w-8 shrink-0 rounded-full border border-black/12"
                        initialsClassName="flex items-center justify-center rounded-full border border-black/12 bg-black/85 text-[10px] font-bold text-primary"
                      />
                    )}
                    <div className="surface-card min-w-0 flex-1 border-black/10 p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{comment.authorName}</span>
                        <span className="text-[10px] text-muted">
                          {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt as unknown as string)) + ' ago' : 'Just now'}
                        </span>
                      </div>
                      <p className="text-sm font-normal text-[var(--text-primary)]">{comment.content}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && <p className="py-4 text-center text-sm text-muted">No comments yet.</p>}
              </div>

              <form onSubmit={handleAddComment} className="flex min-w-0 gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment…"
                  className="input-field min-w-0 flex-1 py-2.5 text-sm"
                />
                <motion.button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="btn-cta flex shrink-0 items-center justify-center px-4 py-2.5 disabled:opacity-40"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <Send size={17} />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isDeletingPost && setShowDeleteConfirm(false)}
          >
            <motion.div
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 text-white shadow-2xl"
              style={{ background: 'linear-gradient(165deg, #1f1f1f 0%, #0d0d0d 100%)' }}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full bg-primary/25 blur-3xl" />
              <div className="relative p-5">
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-black shadow-inner">
                    <AlertTriangle size={20} strokeWidth={2.25} />
                  </span>
                  <div>
                    <p className="font-display text-2xl leading-tight text-white">Delete post?</p>
                    <p className="mt-1 text-sm text-white/65">
                      This action cannot be undone. Your post will be removed permanently.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeletingPost}
                    className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10 disabled:opacity-60"
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => void handleDelete()}
                    disabled={isDeletingPost}
                    className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-black shadow-[0_8px_24px_-6px_rgba(250,204,21,0.6)] hover:brightness-95 disabled:opacity-60"
                    whileTap={{ scale: 0.98 }}
                  >
                    {isDeletingPost ? 'Deleting...' : 'Yes, delete'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
