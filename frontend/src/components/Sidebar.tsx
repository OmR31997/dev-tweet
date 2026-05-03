import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Hash, Bell, Mail, User, Settings, LogOut, MoreHorizontal, X, Hash as HashIcon, AlertTriangle } from 'lucide-react';
import { auth, signOut } from '../apiClient';

const TAGS = ['#engineering', '#opensource', '#devops', '#web', '#systems'];

const navItems = [
  { id: 'feed', icon: Home, label: 'Home' },
  { id: 'explore', icon: Hash, label: 'Explore' },
  { id: 'notifications', icon: Bell, label: 'Activity' },
  { id: 'messages', icon: Mail, label: 'Messages' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function Sidebar({
  activeView,
  onNavigate,
  profileMode = null,
  unreadNotificationCount = 0,
  unreadMessageCount = 0,
}: {
  activeView: string;
  onNavigate: (view: string) => void;
  profileMode?: 'self' | 'other' | null;
  unreadNotificationCount?: number;
  unreadMessageCount?: number;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const openLogoutConfirm = () => {
    setMobileMenuOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const navButtonBase =
    'group relative flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all duration-200 xl:px-3';
  const navInactive =
    'text-white/55 hover:bg-white/[0.07] hover:text-white active:scale-[0.99]';
  const navActive =
    'bg-primary text-black shadow-[0_8px_24px_-4px_rgba(250,204,21,0.55)] ring-1 ring-black/10';

  return (
    <>
      <aside className="sticky top-[4.5rem] hidden h-fit w-14 shrink-0 flex-col gap-4 self-start md:flex xl:w-[15.5rem]">
        {/* Primary nav — dark rail */}
        <div
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] text-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.45)]"
          style={{
            background: 'linear-gradient(165deg, #1a1a1a 0%, #0a0a0a 48%, #111 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="pointer-events-none absolute -right-8 top-0 h-32 w-32 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

          <nav className="relative flex flex-col gap-0.5 p-2 xl:p-2.5">
            <div className="mb-2 hidden items-center justify-between gap-2 px-1.5 pt-0.5 xl:flex">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-hand text-lg font-bold leading-none text-black shadow-sm">
                  D
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold font-hand uppercase tracking-[0.2em] text-white/40">Workspace</p>
                  <p className="truncate font-hand text-lg leading-tight text-white">Navigate</p>
                </div>
              </div>
            </div>
            <div className="mb-1 hidden h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent xl:block" />

            {navItems.map((item) => {
              const active =
                profileMode === 'other'
                  ? false
                  : profileMode === 'self'
                  ? item.id === 'profile'
                  : activeView === 'settings'
                  ? false
                  : activeView === item.id;
              const badgeCount =
                item.id === 'notifications'
                  ? unreadNotificationCount
                  : item.id === 'messages'
                  ? unreadMessageCount
                  : 0;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  title={item.label}
                  className={`${navButtonBase} ${active ? navActive : navInactive}`}
                  whileTap={{ scale: 0.98 }}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-r-full bg-black xl:block" />
                  )}
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      active
                        ? 'border-black/15 bg-black/10'
                        : 'border-white/[0.08] bg-white/[0.04] group-hover:border-white/15 group-hover:bg-white/[0.08]'
                    }`}
                  >
                    <item.icon size={19} strokeWidth={active ? 2.5 : 2} className={active ? 'text-black' : 'text-white/90'} />
                  </span>
                  {badgeCount > 0 && (
                    <span className="absolute left-8 top-2.5 min-w-[1.1rem] rounded-full bg-primary px-1 text-center text-[10px] font-bold leading-[1.1rem] text-black ring-2 ring-black xl:left-7">
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                  <span className="hidden min-w-0 flex-1 truncate text-sm font-semibold tracking-tight xl:inline">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}

            <motion.button
              type="button"
              onClick={() => onNavigate('settings')}
              title="Settings"
              className={`${navButtonBase} ${
                profileMode !== null ? navInactive : activeView === 'settings' ? navActive : navInactive
              }`}
              whileTap={{ scale: 0.98 }}
            >
              {activeView === 'settings' && profileMode === null && (
                <span className="absolute left-0 top-1/2 hidden h-6 w-1 -translate-y-1/2 rounded-r-full bg-black xl:block" />
              )}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  activeView === 'settings' && profileMode === null
                    ? 'border-black/15 bg-black/10'
                    : 'border-white/[0.08] bg-white/[0.04] group-hover:border-white/15 group-hover:bg-white/[0.08]'
                }`}
              >
                <Settings
                  size={19}
                  strokeWidth={activeView === 'settings' && profileMode === null ? 2.5 : 2}
                  className={activeView === 'settings' && profileMode === null ? 'text-black' : 'text-white/90'}
                />
              </span>
              <span className="hidden min-w-0 flex-1 truncate text-sm font-semibold tracking-tight xl:inline">Settings</span>
            </motion.button>

            <div className="my-2 flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
            </div>

            <motion.button
              type="button"
              onClick={openLogoutConfirm}
              title="Log out"
              className={`${navButtonBase} text-white/45 hover:bg-white/[0.07] hover:text-white`}
              whileTap={{ scale: 0.98 }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]">
                <LogOut size={19} strokeWidth={2} className="text-white/70" />
              </span>
              <span className="hidden text-sm font-medium xl:inline">Log out</span>
            </motion.button>
          </nav>
        </div>

        {/* Tags — light inset card */}
        <div className="relative hidden overflow-hidden rounded-2xl border border-black/12 bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-elevated)] xl:block">
          <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-primary" />
          <div className="pointer-events-none absolute -right-4 top-6 h-20 w-20 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative pl-2">
            <div className="mb-3 flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-primary shadow-inner">
                <HashIcon size={18} strokeWidth={2.25} className="text-primary" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-black/45">Trending</p>
                <p className="font-display text-xl text-black">Tags worth a look</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag, i) => (
                <motion.button
                  key={tag}
                  type="button"
                  className="rounded-full border border-black/10 bg-[var(--surface-page)] px-3 py-1.5 text-xs font-semibold text-black/80 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/15 hover:shadow-md"
                  style={{ transitionDelay: `${i * 20}ms` }}
                  whileTap={{ scale: 0.97 }}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile dock */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[max(0.35rem,env(safe-area-inset-bottom,0px))]">
        <div
          className="pointer-events-auto mx-3 mb-2 flex items-stretch justify-around gap-0.5 rounded-2xl border border-white/10 px-1 py-2 shadow-[0_-8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          style={{ background: 'linear-gradient(180deg, rgba(26,26,26,0.96) 0%, rgba(10,10,10,0.98) 100%)' }}
        >
          {navItems.map((item) => {
            const active =
              profileMode === 'other'
                ? false
                : profileMode === 'self'
                ? item.id === 'profile'
                : activeView === 'settings'
                ? false
                : activeView === item.id;
            const badgeCount =
              item.id === 'notifications'
                ? unreadNotificationCount
                : item.id === 'messages'
                ? unreadMessageCount
                : 0;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl py-1.5 touch-manipulation transition-colors ${
                  active ? 'text-primary' : 'text-white/45'
                }`}
                whileTap={{ scale: 0.94 }}
              >
                {active && (
                  <span className="absolute inset-x-1.5 top-1 bottom-1 -z-10 rounded-xl bg-primary/15 ring-1 ring-primary/30" />
                )}
                <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                {badgeCount > 0 && (
                  <span className="absolute right-3 top-0.5 min-w-[1rem] rounded-full bg-primary px-1 text-center text-[9px] font-bold leading-[1rem] text-black ring-2 ring-black">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
                <span className="mt-0.5 max-w-full truncate text-[9px] font-semibold uppercase tracking-wide">{item.label}</span>
              </motion.button>
            );
          })}
          <motion.button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`relative flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl py-1.5 touch-manipulation transition-colors ${
              mobileMenuOpen || (activeView === 'settings' && profileMode !== 'other') ? 'text-primary' : 'text-white/45'
            }`}
            whileTap={{ scale: 0.94 }}
            aria-label="More options"
          >
            {(mobileMenuOpen || (activeView === 'settings' && profileMode !== 'other')) && (
              <span className="absolute inset-x-1.5 top-1 bottom-1 -z-10 rounded-xl bg-primary/15 ring-1 ring-primary/30" />
            )}
            <MoreHorizontal size={22} strokeWidth={mobileMenuOpen ? 2.5 : 2} />
            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide">More</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/50 backdrop-blur-sm md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              className="m-3 mb-[max(0.75rem,calc(0.75rem+env(safe-area-inset-bottom)))] overflow-hidden rounded-2xl border border-white/10 p-4 text-white shadow-2xl"
              style={{ background: 'linear-gradient(165deg, #1f1f1f 0%, #0d0d0d 100%)' }}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-display text-2xl text-white">More</span>
                <motion.button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl p-2 text-white/50 hover:bg-white/10 hover:text-white"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close menu"
                >
                  <X size={20} />
                </motion.button>
              </div>
              <motion.button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('settings');
                }}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left font-medium hover:bg-primary/20"
                whileTap={{ scale: 0.99 }}
              >
                <Settings size={20} className="text-primary" />
                Settings
              </motion.button>
              <motion.button
                type="button"
                onClick={openLogoutConfirm}
                className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left font-medium text-white/80 hover:bg-white/10 hover:text-white"
                whileTap={{ scale: 0.99 }}
              >
                <LogOut size={20} />
                Log out
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isLoggingOut && setShowLogoutConfirm(false)}
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
                    <p className="font-display text-2xl leading-tight text-white">Log out?</p>
                    <p className="mt-1 text-sm text-white/65">You will need to sign in again to continue.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)}
                    disabled={isLoggingOut}
                    className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/10 disabled:opacity-60"
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => void handleLogout()}
                    disabled={isLoggingOut}
                    className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-black shadow-[0_8px_24px_-6px_rgba(250,204,21,0.6)] hover:brightness-95 disabled:opacity-60"
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoggingOut ? 'Logging out...' : 'Yes, log out'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
