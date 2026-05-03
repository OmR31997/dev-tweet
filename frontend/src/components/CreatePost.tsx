import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, handleFirestoreError, OperationType, createPost, uploadPostImage } from '../apiClient';
import { Send, Image as ImageIcon } from 'lucide-react';
import type { Post } from '../types';

export default function CreatePost({ onPostCreated }: { onPostCreated?: (post: Post) => void }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && files.length === 0) || !auth.currentUser) return;

    setIsSubmitting(true);
    try {
      let imageIds: string[] = [];
      if (files.length > 0) {
        const uploaded = await Promise.all(files.map((file) => uploadPostImage(file)));
        imageIds = uploaded.map((u) => u.id);
      }
      const createdPost = (await createPost(content.trim(), imageIds)) as Post;
      onPostCreated?.(createdPost);
      setContent('');
      setFiles([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'posts');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="surface-feed-card relative mb-4 overflow-hidden sm:mb-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-primary via-[#fde047] to-primary" />
      <div className="relative bg-gradient-to-b from-[var(--surface-page)]/80 to-[var(--surface-elevated)] p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 sm:mb-4">
          <span className="rounded-full bg-neutral-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            Compose
          </span>
          <span className="text-xs font-medium text-muted">What are you shipping?</span>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update, snippet, or link…"
            className="w-full resize-none rounded-xl border border-black/8 bg-white/90 px-3 py-3 text-base font-normal text-[var(--text-primary)] shadow-inner outline-none ring-0 transition-[box-shadow,border-color] placeholder:text-muted focus:border-primary/40 focus:shadow-[0_0_0_3px_rgba(250,204,21,0.2)] sm:min-h-[104px] sm:px-4 sm:text-[15px] sm:leading-relaxed"
          />
          <div className="mt-3 flex flex-col gap-3 border-t border-black/8 pt-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
            <div className="flex items-center gap-1">
              <input
                id="post-image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const selected = Array.from(e.target.files ?? []);
                  if (selected.length === 0) return;
                  setFiles((prev) => [...prev, ...selected].slice(0, 4));
                  e.currentTarget.value = '';
                }}
                className="hidden"
              />
              <motion.button
                type="button"
                onClick={() => document.getElementById('post-image-upload')?.click()}
                className="rounded-xl border border-transparent p-2.5 text-muted transition-colors hover:border-black/10 hover:bg-primary/10 hover:text-black"
                whileTap={{ scale: 0.92 }}
                aria-label="Add image"
              >
                <ImageIcon size={20} strokeWidth={1.85} />
              </motion.button>
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitting || (!content.trim() && files.length === 0)}
              className="btn-cta flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-[0_4px_14px_-3px_rgba(250,204,21,0.65)] sm:w-auto sm:px-8 sm:py-2.5"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              <Send size={17} strokeWidth={2.25} />
              {isSubmitting ? 'Posting…' : 'Post'}
            </motion.button>
          </div>
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-2 py-1 text-xs">
                  <span className="max-w-[150px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="rounded px-1 text-muted hover:bg-black/5 hover:text-black"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
}
