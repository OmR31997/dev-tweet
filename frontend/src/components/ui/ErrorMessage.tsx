import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

type ErrorMessageProps = {
  children: ReactNode;
  /** Short label above the body (e.g. "Couldn't sign in") */
  title?: string;
  className?: string;
};

/**
 * Inline error aligned with the yellow / black / white light theme (not generic red).
 */
export default function ErrorMessage({ children, title, className = '' }: ErrorMessageProps) {
  return (
    <div role="alert" aria-live="polite" className={`theme-alert ${className}`.trim()}>
      <div className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/25 ring-1 ring-black/8">
          <AlertCircle className="text-black" size={18} strokeWidth={2} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          {title ? (
            <>
              <p className="heading text-sm">{title}</p>
              <p className="mt-1 text-sm font-normal leading-relaxed text-black/85">{children}</p>
            </>
          ) : (
            <p className="text-sm font-normal leading-relaxed text-black/85">{children}</p>
          )}
        </div>
      </div>
    </div>
  );
}
