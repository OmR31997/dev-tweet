import { motion } from 'framer-motion';

export default function TypingIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 px-1 py-0.5 ${className}`} aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current opacity-60"
          animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
