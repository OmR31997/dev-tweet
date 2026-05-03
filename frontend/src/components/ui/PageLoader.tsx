import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  BookOpen,
  GraduationCap,
  Hash,
  MessageCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import campusDots from '../../assets/lottie/campus-dots.json';

export type PageLoaderVariant =
  | 'auth'
  | 'feed'
  | 'explore'
  | 'messages'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'default';

const COPY: Record<
  PageLoaderVariant,
  { title: string; subtitle: string; hint?: string }
> = {
  auth: {
    title: 'Opening campus pass',
    subtitle: 'Verifying your session with DevTweet Hub…',
  },
  feed: {
    title: 'Loading your feed',
    subtitle: 'Pulling the latest from your college circle…',
    hint: '#engineering · projects · hot takes',
  },
  explore: {
    title: 'Exploring the hub',
    subtitle: 'Finding tags and posts across campus…',
  },
  messages: {
    title: 'Syncing messages',
    subtitle: 'Almost ready to chat with your crew…',
  },
  notifications: {
    title: 'Checking the bell',
    subtitle: 'Gathering likes, replies, and follows…',
  },
  profile: {
    title: 'Loading your profile',
    subtitle: 'Fetching bio, college, and branch…',
  },
  settings: {
    title: 'Preparing settings',
    subtitle: 'Just a moment…',
  },
  default: {
    title: 'Loading',
    subtitle: 'Hang tight…',
  },
};

const DECOR: Record<PageLoaderVariant, LucideIcon[]> = {
  auth: [GraduationCap, Sparkles],
  feed: [BookOpen, Hash, Sparkles],
  explore: [Hash, Users, Sparkles],
  messages: [MessageCircle, Users],
  notifications: [Bell, Sparkles],
  profile: [GraduationCap, BookOpen],
  settings: [Sparkles, BookOpen],
  default: [Sparkles, Hash],
};

function CampusDecor({ variant }: { variant: PageLoaderVariant }) {
  const icons = DECOR[variant];
  const positions = [
    { x: -52, y: -28, rotate: -12 },
    { x: 48, y: -32, rotate: 10 },
    { x: -40, y: 44, rotate: 8 },
    { x: 44, y: 40, rotate: -6 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {icons.map((Icon, i) => {
        const p = positions[i % positions.length];
        return (
          <motion.div
            key={`${variant}-${i}`}
            className="absolute text-black/28"
            style={{ left: '50%', top: '50%' }}
            initial={{ x: p.x, y: p.y, opacity: 0.3, rotate: p.rotate }}
            animate={{
              y: [p.y, p.y - 6, p.y],
              opacity: [0.35, 0.55, 0.35],
              rotate: [p.rotate, p.rotate + 4, p.rotate],
            }}
            transition={{
              duration: 2.4 + i * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.15,
            }}
          >
            <Icon size={variant === 'auth' ? 28 : 24} strokeWidth={1.5} />
          </motion.div>
        );
      })}
    </div>
  );
}

type PageLoaderProps = {
  variant?: PageLoaderVariant;
  /** Full viewport (e.g. initial auth check) */
  fullScreen?: boolean;
  /** Smaller card for modals */
  compact?: boolean;
  className?: string;
};

export default function PageLoader({
  variant = 'default',
  fullScreen = false,
  compact = false,
  className = '',
}: PageLoaderProps) {
  const copy = COPY[variant];
  const lottieSize = compact ? 72 : fullScreen ? 140 : 112;

  const inner = (
    <div
      className={`relative flex flex-col items-center justify-center gap-4 text-center ${
        compact ? 'py-8' : fullScreen ? 'py-20' : 'py-16 sm:py-20'
      } ${className}`}
    >
      <div
        className={`relative ${compact ? 'h-24 w-24' : 'h-32 w-32 sm:h-36 sm:w-36'}`}
      >
        <CampusDecor variant={variant} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Lottie
            animationData={campusDots as unknown as object}
            loop
            className="drop-shadow-sm"
            style={{ width: lottieSize, height: lottieSize }}
            aria-hidden
          />
        </div>
      </div>
      <div className="max-w-xs px-2 sm:max-w-sm">
        <p className="heading text-base sm:text-lg">{copy.title}</p>
        <p className="mt-1.5 text-sm font-normal leading-relaxed text-muted">{copy.subtitle}</p>
        {copy.hint && !compact && (
          <p className="mt-3 text-sm text-black/60">{copy.hint}</p>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--surface-page)] px-4">
        <motion.div
          className="surface-loader-card w-full max-w-md px-4 py-2"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {inner}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={compact ? '' : 'w-full'}
    >
      {inner}
    </motion.div>
  );
}
