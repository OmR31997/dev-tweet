import { LocaleSwitcher } from "@/components/ui";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showLocale?: boolean;
}

/** Sticky top bar shared across the app screens. */
export function PageHeader({
  title,
  subtitle,
  actions,
  showLocale = true,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background px-5 py-3.5 [padding-top:max(0.875rem,env(safe-area-inset-top))] md:px-6 md:py-4 md:[padding-top:1rem]">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {actions}
        {showLocale ? <LocaleSwitcher /> : null}
      </div>
    </header>
  );
}
