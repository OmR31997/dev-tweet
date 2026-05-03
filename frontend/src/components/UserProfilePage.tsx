import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, GraduationCap, Users, X } from 'lucide-react';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType, fetchUserById, fetchUsers, type User } from '../apiClient';
import type { Post, UserProfile } from '../types';
import PostCard from './PostCard';
import PageLoader from './ui/PageLoader';
import { profileHandleFromEmail } from '../utils/profileHandle';
import Avatar from './ui/Avatar';

type UserProfilePageProps = {
  userId: string;
  onBack: () => void;
  posts: Post[];
  currentUser: User | null;
  viewerProfile: UserProfile | null;
  onFollow: (targetUserId: string) => void;
  onEditOwnProfile: () => void;
  onOpenProfile: (uid: string) => void;
  onPostDeleted?: (postId: string) => void;
};

export default function UserProfilePage({
  userId,
  onBack,
  posts,
  currentUser,
  viewerProfile,
  onFollow,
  onEditOwnProfile,
  onOpenProfile,
  onPostDeleted,
}: UserProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [connectionsModal, setConnectionsModal] = useState<'followers' | 'following' | null>(null);
  const [connections, setConnections] = useState<UserProfile[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const isOwn = currentUser?.uid === userId;
  const isFollowing = viewerProfile?.following?.includes(userId);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const user = (await fetchUserById(userId)) as UserProfile;
        if (mounted) setProfile(user);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'users/' + userId);
        if (mounted) setProfile(null);
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 15000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [userId]);

  const userPosts = useMemo(() => posts.filter((p) => p.authorId === userId), [posts, userId]);

  const joinedText = useMemo(() => {
    const c = profile?.createdAt;
    if (!c) return null;
    try {
      const d = typeof c.toDate === 'function' ? c.toDate() : new Date(c as string);
      return format(d, 'MMMM yyyy');
    } catch {
      return null;
    }
  }, [profile?.createdAt]);

  if (profile === undefined) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-2xl flex-1">
        <PageLoader variant="profile" />
      </div>
    );
  }

  if (profile === null) {
    if (isOwn) {
      return (
        <div className="mx-auto w-full min-w-0 max-w-2xl flex-1">
          <PageLoader variant="profile" />
        </div>
      );
    }
    return (
      <div className="mx-auto w-full min-w-0 max-w-2xl flex-1">
        <div className="mb-4">
          <motion.button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-black hover:bg-primary/15"
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={20} strokeWidth={2} />
            Back
          </motion.button>
        </div>
        <div className="surface-card p-10 text-center">
          <p className="heading text-lg">Profile not found</p>
          <p className="mt-2 text-sm text-muted">This account may have been removed.</p>
        </div>
      </div>
    );
  }

  const followers = profile.followers?.length ?? 0;
  const following = profile.following?.length ?? 0;

  const openConnections = async (type: 'followers' | 'following') => {
    if (!profile) return;
    setConnectionsModal(type);
    setConnectionsLoading(true);
    try {
      const ids = type === 'followers' ? profile.followers ?? [] : profile.following ?? [];
      const allUsers = (await fetchUsers()) as UserProfile[];
      const usersById = new Map(allUsers.map((u) => [u.uid, u]));

      const missingIds = ids.filter((id) => !usersById.has(id));
      if (missingIds.length > 0) {
        const missingUsers = await Promise.all(
          missingIds.map(async (id) => {
            try {
              return (await fetchUserById(id)) as UserProfile;
            } catch {
              return null;
            }
          }),
        );
        for (const user of missingUsers) {
          if (user) usersById.set(user.uid, user);
        }
      }

      const orderedConnections = ids
        .map((id) => usersById.get(id))
        .filter((u): u is UserProfile => Boolean(u));
      setConnections(orderedConnections);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
      setConnections([]);
    } finally {
      setConnectionsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl flex-1">
      <div className="mb-3 flex items-center gap-2 sm:mb-4">
        <motion.button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium text-black hover:bg-primary/15"
          whileTap={{ scale: 0.98 }}
          aria-label="Back"
        >
          <ArrowLeft size={20} strokeWidth={2} />
          <span className="hidden sm:inline">Back</span>
        </motion.button>
      </div>

      <div className="surface-card mb-4 overflow-hidden sm:mb-5">
        <div className="h-28 bg-gradient-to-br from-primary/35 via-primary/15 to-[var(--surface-page)] sm:h-36" />
        <div className="relative px-4 pb-5 pt-0 sm:px-6">
          <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <Avatar
              name={profile.displayName}
              src={profile.photoURL}
              className="h-24 w-24 shrink-0 rounded-full border-4 border-[var(--surface-elevated)] bg-[var(--surface-page)] object-cover shadow-md sm:h-28 sm:w-28"
              initialsClassName="flex items-center justify-center rounded-full border-4 border-[var(--surface-elevated)] bg-black/85 text-xl font-bold text-primary shadow-md sm:text-2xl"
            />
            <div className="flex w-full flex-col gap-3 sm:mb-1 sm:ml-auto sm:w-auto sm:items-end">
              {isOwn ? (
                <motion.button
                  type="button"
                  onClick={onEditOwnProfile}
                  className="btn-secondary w-full px-5 py-2.5 text-sm font-semibold sm:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Edit profile
                </motion.button>
              ) : currentUser ? (
                <motion.button
                  type="button"
                  onClick={() => onFollow(userId)}
                  className={
                    isFollowing
                      ? 'btn-secondary w-full px-5 py-2.5 text-sm font-semibold sm:w-auto'
                      : 'btn-cta w-full px-5 py-2.5 text-sm font-semibold sm:w-auto'
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </motion.button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 sm:mt-4">
            <h1 className="heading text-xl sm:text-2xl">{profile.displayName || 'User'}</h1>
            <p className="text-sm text-muted">{profileHandleFromEmail(profile.email)}</p>
            {profile.bio ? (
              <p className="mt-3 max-w-xl whitespace-pre-wrap text-base font-normal leading-relaxed text-black">{profile.bio}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              {profile.college ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} className="shrink-0 text-black/50" />
                  {profile.college}
                </span>
              ) : null}
              {profile.branch ? (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap size={15} className="shrink-0 text-black/50" />
                  {profile.branch}
                </span>
              ) : null}
              {joinedText ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={15} className="shrink-0 text-black/50" />
                  Joined {joinedText}
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 border-t border-black/10 pt-4 text-sm">
              <button
                type="button"
                onClick={() => void openConnections('following')}
                className="rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-primary/15"
              >
                <span className="font-semibold text-black">{following}</span>{' '}
                <span className="text-muted">Following</span>
              </button>
              <button
                type="button"
                onClick={() => void openConnections('followers')}
                className="rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-primary/15"
              >
                <span className="font-semibold text-black">{followers}</span>{' '}
                <span className="text-muted">Followers</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3 border-b border-black/10 pb-2">
        <h2 className="heading text-sm uppercase tracking-wide text-muted">Posts</h2>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {userPosts.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} onAuthorClick={onOpenProfile} onDeleteSuccess={onPostDeleted} />
            ))}
          </AnimatePresence>
        ) : (
          <motion.div
            className="surface-card py-12 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-muted">No posts yet.</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {connectionsModal && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConnectionsModal(null)}
          >
            <motion.div
              className="surface-card w-full max-w-md"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-black/10 p-4">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-black" />
                  <h3 className="heading text-base">
                    {connectionsModal === 'followers' ? 'Followers' : 'Following'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setConnectionsModal(null)}
                  className="rounded-xl p-2 text-muted hover:bg-black/5"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-3">
                {connectionsLoading ? (
                  <PageLoader variant="profile" compact />
                ) : connections.length > 0 ? (
                  <div className="space-y-2">
                    {connections.map((person) => (
                      <div
                        key={person.uid}
                        className="flex w-full items-center gap-3 rounded-xl border border-black/10 bg-white p-3 transition-colors hover:bg-primary/10"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setConnectionsModal(null);
                            onOpenProfile(person.uid);
                          }}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <Avatar
                            name={person.displayName}
                            src={person.photoURL}
                            className="h-10 w-10 shrink-0 rounded-full border border-black/12 object-cover"
                            initialsClassName="flex items-center justify-center rounded-full border border-black/12 bg-black/85 text-xs font-bold text-primary"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-black">{person.displayName}</p>
                            <p className="truncate text-xs text-muted">{profileHandleFromEmail(person.email)}</p>
                          </div>
                        </button>

                        {currentUser?.uid === person.uid ? (
                          <span className="shrink-0 rounded-lg border border-black/10 bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-black/65">
                            You
                          </span>
                        ) : currentUser ? (
                          <motion.button
                            type="button"
                            onClick={() => onFollow(person.uid)}
                            className={
                              viewerProfile?.following?.includes(person.uid)
                                ? 'btn-secondary shrink-0 px-3 py-1.5 text-xs'
                                : 'btn-cta shrink-0 px-3 py-1.5 text-xs'
                            }
                            whileTap={{ scale: 0.96 }}
                          >
                            {viewerProfile?.following?.includes(person.uid)
                              ? 'Following'
                              : connectionsModal === 'followers'
                              ? 'Follow back'
                              : 'Follow'}
                          </motion.button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted">No users found.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
