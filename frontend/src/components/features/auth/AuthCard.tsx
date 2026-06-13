import Link from "next/link";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-xl font-bold tracking-tight"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            D
          </span>
          DevTweetHub
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>

        {footer ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </p>
        ) : null}
      </div>
    </div>
  );
}
