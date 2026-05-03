import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  handleFirestoreError,
  OperationType,
  auth,
  onAuthStateChanged,
  type User,
  fetchPosts,
  fetchMe,
  fetchUsers,
  toggleFollow,
  fetchNotifications,
  fetchUnreadMessageCount,
} from './apiClient';
import { Post, UserProfile } from './types';
import Auth from './components/Auth';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import Sidebar from './components/Sidebar';
import Notifications from './components/Notifications';
import Messages from './components/Messages';
import ProfileModal from './components/ProfileModal';
import UserProfilePage from './components/UserProfilePage';
import SettingsPage from './components/SettingsPage';
import PageLoader from './components/ui/PageLoader';
import { Search, TrendingUp, AlertTriangle, Heart, Bell } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let message = 'Something went wrong.';
      try {
        const errInfo = JSON.parse(this.state.error?.message || '{}');
        if (errInfo.error) message = `Integration Error: ${errInfo.error}`;
      } catch {
        message = this.state.error?.message || message;
      }

      return (
        <div className="flex min-h-dvh items-center justify-center bg-[var(--surface-page)] p-4">
          <div className="theme-error-panel w-full max-w-md">
            <div className="theme-error-panel-icon">
              <AlertTriangle className="text-black" size={28} strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="heading mb-2 text-xl">Something broke</h2>
            <p className="mb-6 rounded-xl border border-black/10 border-l-4 border-l-primary bg-white px-4 py-3 text-left text-sm leading-relaxed text-black/90 shadow-sm">
              {message}
            </p>
            <motion.button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-cta w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Reload
            </motion.button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function FollowCard({
  person,
  isFollowing,
  ctaLabel,
  onFollow,
  onViewProfile,
}: {
  person: UserProfile;
  isFollowing: boolean;
  ctaLabel?: string;
  onFollow: () => void;
  onViewProfile?: (uid: string) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = person.displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';
  const showInitialsAvatar = !person.photoURL || imageFailed;

  const main = (
    <>
      {showInitialsAvatar ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/15 bg-black/85 text-xs font-bold text-primary">
          {initials}
        </div>
      ) : (
        <img
          src={person.photoURL}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full border border-black/15 object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{person.displayName}</p>
        <p className="truncate text-xs text-muted">{person.branch || 'Developer'}</p>
      </div>
    </>
  );

  return (
    <motion.div
      className="flex items-center gap-2 rounded-xl border border-black/8 bg-white/70 p-3 shadow-sm backdrop-blur-sm sm:gap-3"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      {onViewProfile ? (
        <button
          type="button"
          onClick={() => onViewProfile(person.uid)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left outline-none ring-black/20 transition-colors hover:bg-primary/10 focus-visible:ring-2"
        >
          {main}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{main}</div>
      )}
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onFollow();
        }}
        className={
          isFollowing
            ? 'btn-secondary shrink-0 px-3 py-1.5 text-xs'
            : 'btn-cta shrink-0 px-3 py-1.5 text-xs'
        }
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        {isFollowing ? 'Following' : ctaLabel ?? 'Follow'}
      </motion.button>
    </motion.div>
  );
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('feed');
  const [viewingProfileUid, setViewingProfileUid] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchUsers, setSearchUsers] = useState<UserProfile[]>([]);
  const [searchPosts, setSearchPosts] = useState<Post[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadPosts = async () => {
      try {
        const postsData = (await fetchPosts()) as Post[];
        if (mounted) setPosts(postsData);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'posts');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void loadPosts();
    const interval = window.setInterval(() => void loadPosts(), 15000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    let mounted = true;
    const loadProfile = async () => {
      try {
        const profile = (await fetchMe()) as UserProfile;
        if (mounted) setUserProfile(profile);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        if (mounted) setUserProfile(null);
      }
    };
    void loadProfile();
    const interval = window.setInterval(() => void loadProfile(), 15000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!user) return;
    const q = debouncedSearchQuery;
    if (q.length < 2) {
      setSearchUsers([]);
      setSearchPosts([]);
      setSearchLoading(false);
      return;
    }
    let mounted = true;
    const runSearch = async () => {
      setSearchLoading(true);
      try {
        const [users, posts] = await Promise.all([fetchUsers(q, 8), fetchPosts(q, 40)]);
        if (!mounted) return;
        setSearchUsers((users as UserProfile[]).filter((u) => u.uid !== user.uid));
        setSearchPosts(posts as Post[]);
      } catch (error) {
        if (mounted) {
          setSearchUsers([]);
          setSearchPosts([]);
          console.error('[search]', error);
        }
      } finally {
        if (mounted) setSearchLoading(false);
      }
    };
    void runSearch();
    return () => {
      mounted = false;
    };
  }, [debouncedSearchQuery, user]);

  useEffect(() => {
    if (!user) {
      setUnreadNotificationCount(0);
      return;
    }
    let mounted = true;
    const loadUnread = async () => {
      try {
        const notifications = await fetchNotifications();
        const unread = notifications.filter((n: any) => !n.read).length;
        if (mounted) setUnreadNotificationCount(unread);
      } catch {
        if (mounted) setUnreadNotificationCount(0);
      }
    };
    void loadUnread();
    const interval = window.setInterval(() => void loadUnread(), 4000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [user, activeView]);

  useEffect(() => {
    if (!user) {
      setUnreadMessageCount(0);
      return;
    }
    let mounted = true;
    const loadUnreadMessages = async () => {
      try {
        const result = await fetchUnreadMessageCount();
        if (mounted) setUnreadMessageCount(result.count ?? 0);
      } catch {
        if (mounted) setUnreadMessageCount(0);
      }
    };
    void loadUnreadMessages();
    const interval = window.setInterval(() => void loadUnreadMessages(), 10000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [user, activeView]);

  useEffect(() => {
    if (!user) {
      setSuggestedUsers([]);
      return;
    }
    let mounted = true;
    const loadUsers = async () => {
      try {
        const usersData = ((await fetchUsers()) as UserProfile[]).filter((u) => u.uid !== user.uid).slice(0, 5);
        if (mounted) setSuggestedUsers(usersData);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'users');
      }
    };
    void loadUsers();
    const interval = window.setInterval(() => void loadUsers(), 20000);
    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [user]);

  const handleFollow = async (targetUserId: string) => {
    if (!user || !userProfile) return;

    try {
      const result = await toggleFollow(targetUserId);
      const isNowFollowing = !!result.following;

      setUserProfile((prev) => {
        if (!prev) return prev;
        const existing = new Set(prev.following ?? []);
        if (isNowFollowing) existing.add(targetUserId);
        else existing.delete(targetUserId);
        return { ...prev, following: Array.from(existing) };
      });

      setSuggestedUsers((prev) =>
        prev.map((u) => {
          if (u.uid !== targetUserId) return u;
          const existingFollowers = new Set(u.followers ?? []);
          if (isNowFollowing && user.uid) existingFollowers.add(user.uid);
          if (!isNowFollowing && user.uid) existingFollowers.delete(user.uid);
          return { ...u, followers: Array.from(existingFollowers) };
        }),
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  const handleNavigate = (view: string) => {
    if (view === 'profile' && user?.uid) {
      setViewingProfileUid(user.uid);
      return;
    }
    setViewingProfileUid(null);
    setActiveView(view);
  };

  const openUserProfile = (uid: string) => setViewingProfileUid(uid);
  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };
  const handlePostCreated = (post: Post) => {
    setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
  };
  const shownPosts = debouncedSearchQuery.length >= 2 ? searchPosts : posts;
  const openSearchUserProfile = (uid: string) => {
    setViewingProfileUid(uid);
    setSearchQuery('');
    setSearchUsers([]);
    setSearchPosts([]);
  };
  const renderSearchDropdown = () => {
    if (debouncedSearchQuery.length < 2) return null;
    return (
      <div className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-[70] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_12px_32px_-14px_rgba(0,0,0,0.35)]">
        <div className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {searchLoading ? (
            <p className="px-3 py-4 text-sm text-muted">Searching...</p>
          ) : (
            <>
              {searchUsers.length > 0 && (
                <div className="mb-1">
                  <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-black/45">People</p>
                  {searchUsers.map((u) => (
                    <button
                      key={u.uid}
                      type="button"
                      onClick={() => openSearchUserProfile(u.uid)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-primary/15"
                    >
                      <span className="text-sm font-semibold text-black">{u.displayName}</span>
                      <span className="truncate text-xs text-muted">{u.branch || u.email}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-black/45">Posts</div>
              {searchPosts.length > 0 ? (
                searchPosts.slice(0, 8).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchUsers([]);
                      setSearchPosts([]);
                      setViewingProfileUid(null);
                      setActiveView('feed');
                    }}
                    className="flex w-full flex-col gap-0.5 rounded-xl px-3 py-2 text-left hover:bg-primary/15"
                  >
                    <span className="text-xs font-semibold text-black">{p.authorName}</span>
                    <span className="truncate text-xs text-muted">{p.content}</span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-muted">No posts found.</p>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (activeView) {
      case 'feed':
      case 'explore':
        return (
          <div className="mx-auto w-full min-w-0 max-w-2xl flex-1">
            {user && activeView === 'feed' && <CreatePost onPostCreated={handlePostCreated} />}
            <div className="space-y-3 sm:space-y-4">
              {loading ? (
                <PageLoader variant={activeView === 'explore' ? 'explore' : 'feed'} />
              ) : shownPosts.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {shownPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onAuthorClick={openUserProfile}
                      onDeleteSuccess={handlePostDeleted}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <motion.div
                  className="surface-feed-card relative overflow-hidden px-6 py-12 text-center sm:px-10 sm:py-16"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
                  <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
                  <div className="relative mx-auto mb-8 flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
                    <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-black/12 bg-gradient-to-br from-primary/20 to-transparent" />
                    <div className="absolute inset-3 rounded-2xl bg-neutral-900 shadow-xl">
                      <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-primary">
                        <div className="h-1 w-12 rounded-full bg-primary/50" />
                        <div className="h-1 w-8 rounded-full bg-primary/35" />
                        <div className="h-1 w-10 rounded-full bg-primary/25" />
                      </div>
                    </div>
                    <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary font-hand text-2xl font-bold text-black shadow-lg ring-4 ring-[var(--surface-elevated)]">
                      +
                    </span>
                  </div>
                  <div className="relative">
                    <p className="font-display text-3xl text-black sm:text-4xl">No posts yet</p>
                    <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                      Start the feed — share a build, a blog link, or a hot take. Use{' '}
                      <span className="font-semibold text-black underline decoration-primary decoration-2 underline-offset-4">
                        #hashtags
                      </span>{' '}
                      so people can find your threads.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="mx-auto w-full min-w-0 max-w-2xl flex-1">
            <Notifications />
          </div>
        );
      case 'messages':
        return (
          <div className="mx-auto w-full min-w-0 max-w-4xl flex-1">
            <Messages />
          </div>
        );
      case 'settings':
        return (
          <div className="mx-auto w-full min-w-0 max-w-2xl flex-1">
            <SettingsPage />
          </div>
        );
      default:
        return (
          <div className="flex-1 min-w-0 px-2 py-16 text-center sm:py-20">
            <p className="heading text-muted text-lg sm:text-xl">Coming soon</p>
          </div>
        );
    }
  };

  if (authLoading) {
    return <PageLoader variant="auth" fullScreen />;
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-[var(--surface-page)] px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:px-6 md:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(250,204,21,0.28),transparent)]" />
          <div className="auth-pages relative mx-auto grid min-h-0 w-full max-w-5xl flex-1 grid-cols-1 content-center items-center gap-5 py-2 sm:gap-8 md:grid-cols-2 md:gap-12 md:py-4">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="shrink-0 text-center md:text-left"
            >
              <h1 className="heading text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                DevTweet
                <span className="text-primary"> Hub</span>
              </h1>
              <p className="mx-auto mt-2 max-w-md text-muted md:mx-0 md:max-w-none">
                A calm, fast home for developers — feed, DMs, and community in one minimal surface.
              </p>
              <ul className="mt-4 hidden space-y-2 text-left text-muted md:block">
                {['Ship updates in a Twitter-style feed', 'Slide into DMs with your cohort', 'Yellow, black & white — campus energy'].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary ring-2 ring-primary/30" />
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="flex min-h-0 w-full justify-center md:justify-end"
            >
              <Auth onAuthReady={setUser} inline />
            </motion.div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-dvh bg-[var(--surface-page)] text-[var(--text-primary)]">
        <div
          className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35]"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% -15%, rgba(250,204,21,0.2), transparent), radial-gradient(ellipse 50% 40% at 100% 50%, rgba(250,204,21,0.06), transparent)',
          }}
        />
        <nav className="sticky top-0 z-50 border-b border-black/[0.06] bg-[var(--glass-bg)] px-3 pt-[max(0.5rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-xl sm:px-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 py-3 min-w-0">
            <motion.button
              type="button"
              onClick={() => {
                setViewingProfileUid(null);
                setActiveView('feed');
              }}
              className="group min-w-0 shrink text-left"
              whileHover={{ opacity: 0.9 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="block truncate font-hand text-xl font-semibold min-[360px]:text-2xl sm:text-3xl md:text-[2rem] md:leading-tight">
                <span className="hidden min-[380px]:inline">
                  DevTweet <span className="text-black/35">·</span> <span className="text-primary">Hub</span>
                </span>
                <span className="min-[380px]:hidden font-bold">DTH</span>
              </span>
              {/* <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-muted min-[380px]:block">
                Developer feed
              </span> */}
            </motion.button>

            <div className="mx-2 hidden min-w-0 max-w-md flex-1 sm:block md:mx-6">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                <input
                  type="search"
                  placeholder="Search people, posts, tags…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-black/10 bg-white/90 py-2.5 pl-10 pr-4 text-sm font-medium text-black shadow-inner outline-none transition-all placeholder:text-black/40 focus:border-primary/45 focus:ring-2 focus:ring-primary/25"
                />
                {renderSearchDropdown()}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <motion.button
                type="button"
                onClick={() => {
                  setViewingProfileUid(null);
                  setActiveView('notifications');
                }}
                className="relative rounded-xl p-2 text-muted hover:bg-primary/15 hover:text-black"
                whileTap={{ scale: 0.95 }}
                aria-label="Open notifications"
                title="Notifications"
              >
                <Bell size={19} />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-[1.1rem] rounded-full bg-primary px-1 text-center text-[10px] font-bold leading-[1.1rem] text-black ring-2 ring-[var(--surface-page)]">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </motion.button>
              <Auth onAuthReady={setUser} />
            </div>
          </div>
          <div className="mx-auto max-w-7xl pb-3 sm:hidden">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
              <input
                type="search"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-black/10 bg-white/90 py-2 pl-10 pr-3 text-sm font-medium shadow-inner outline-none focus:border-primary/45 focus:ring-2 focus:ring-primary/25"
              />
              {renderSearchDropdown()}
            </div>
          </div>
        </nav>

        <main className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-4 md:grid-cols-[auto_1fr] md:pb-10 lg:grid-cols-[auto_1fr_320px] lg:gap-8">
          <Sidebar
            activeView={activeView}
            onNavigate={handleNavigate}
            unreadNotificationCount={unreadNotificationCount}
            unreadMessageCount={unreadMessageCount}
            profileMode={
              viewingProfileUid ? (viewingProfileUid === user?.uid ? 'self' : 'other') : null
            }
          />
          <motion.div
            key={viewingProfileUid ?? activeView}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="min-w-0"
          >
            {viewingProfileUid ? (
              <UserProfilePage
                userId={viewingProfileUid}
                onBack={() => setViewingProfileUid(null)}
                posts={posts}
                currentUser={user}
                viewerProfile={userProfile}
                onFollow={handleFollow}
                onEditOwnProfile={() => setIsProfileOpen(true)}
                onOpenProfile={openUserProfile}
                onPostDeleted={handlePostDeleted}
              />
            ) : (
              renderView()
            )}
          </motion.div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-5">
              <div className="surface-feed-card relative overflow-hidden p-5">
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-primary" />
                <div className="pointer-events-none absolute -right-6 top-4 h-24 w-24 rounded-full bg-primary/12 blur-2xl" />
                <div className="relative mb-4 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-primary shadow-inner">
                    <TrendingUp size={20} strokeWidth={2.25} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Discover</p>
                    <h3 className="font-display text-2xl leading-tight text-black">Who to follow</h3>
                  </div>
                </div>
                <div className="relative flex flex-col gap-3">
                  {suggestedUsers.map((person) => {
                    const isFollowing = userProfile?.following?.includes(person.uid);
                    const followsYou = userProfile?.followers?.includes(person.uid);
                    const ctaLabel = !isFollowing && followsYou ? 'Follow back' : 'Follow';
                    return (
                      <FollowCard
                        key={person.uid}
                        person={person}
                        isFollowing={!!isFollowing}
                        ctaLabel={ctaLabel}
                        onFollow={() => handleFollow(person.uid)}
                        onViewProfile={openUserProfile}
                      />
                    );
                  })}
                  {suggestedUsers.length === 0 && (
                    <p className="rounded-xl border border-dashed border-black/10 bg-[var(--surface-page)]/80 py-8 text-center text-sm font-medium italic text-muted">
                      No suggestions yet — check back soon.
                    </p>
                  )}
                </div>
              </div>

              <footer className="px-1 text-xs text-muted">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span className="cursor-pointer hover:underline">Terms</span>
                  <span className="cursor-pointer hover:underline">Privacy</span>
                  <span className="cursor-pointer hover:underline">Cookies</span>
                </div>
                <p className="mt-4 flex items-center gap-1 font-medium text-[var(--text-primary)]">
                  <Heart size={12} className="text-black" fill="currentColor" />
                  Built for engineers · © 2026
                </p>
              </footer>
            </div>
          </aside>
        </main>

        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      </div>
    </ErrorBoundary>
  );
}
