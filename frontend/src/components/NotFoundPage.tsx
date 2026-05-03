import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { Home } from 'lucide-react';

function notFoundLottieUrl() {
  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}Error%20404.json`;
}

export default function NotFoundPage() {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const prevTitle = document.title;
    const existingRobots = document.querySelector('meta[name="robots"]');
    const prevRobots = existingRobots?.getAttribute('content') ?? null;
    let createdRobots: HTMLMetaElement | null = null;
    document.title = 'Page not found — DevTweet Hub';
    if (existingRobots) {
      existingRobots.setAttribute('content', 'noindex, nofollow');
    } else {
      createdRobots = document.createElement('meta');
      createdRobots.setAttribute('name', 'robots');
      createdRobots.setAttribute('content', 'noindex, nofollow');
      document.head.appendChild(createdRobots);
    }
    return () => {
      document.title = prevTitle;
      if (createdRobots) {
        createdRobots.remove();
      } else if (existingRobots) {
        if (prevRobots) existingRobots.setAttribute('content', prevRobots);
        else existingRobots.setAttribute('content', 'index, follow');
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const url = notFoundLottieUrl();
    void fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<object>;
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const goHome = () => {
    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    window.location.replace(base);
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--surface-page)] p-6">
      <motion.div
        className="surface-card relative w-full max-w-lg overflow-hidden border border-black/10 p-6 text-center shadow-[var(--shadow-elevated)] sm:p-10"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      >
        <div className="pointer-events-none absolute -right-12 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative mx-auto flex max-h-[min(52vh,420px)] w-full max-w-md items-center justify-center">
          {animationData && !loadError ? (
            <Lottie
              animationData={animationData}
              loop
              className="w-full max-w-[min(100%,380px)]"
              aria-hidden
            />
          ) : loadError ? (
            <p className="py-16 text-sm text-muted">Could not load the animation.</p>
          ) : (
            <div className="flex h-48 w-full items-center justify-center">
              <div className="h-10 w-10 animate-pulse rounded-full bg-primary/30" aria-hidden />
            </div>
          )}
        </div>
        <h1 className="font-display relative mt-2 text-3xl text-black sm:text-4xl">Page not found</h1>
        <p className="relative mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          This URL does not match anything in DevTweet Hub. Head back home and keep building.
        </p>
        <motion.button
          type="button"
          onClick={goHome}
          className="btn-cta relative mt-8 inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Home size={18} strokeWidth={2.25} aria-hidden />
          Back to home
        </motion.button>
      </motion.div>
    </div>
  );
}
