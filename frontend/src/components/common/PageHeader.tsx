import { LocaleSwitcher } from "@/components/ui";
import { PAGE_GUTTER } from "@/components/common/PageLayout";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showLocale?: boolean;
}

/** Pinned top bar shared across the app screens (used with PageLayout). */
export function PageHeader({
  title,
  subtitle,
  actions,
  showLocale = true,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "z-30 flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background py-3.5 [padding-top:max(0.875rem,env(safe-area-inset-top))] supports-[backdrop-filter]:bg-background/95 supports-[backdrop-filter]:backdrop-blur-sm sm:gap-4 md:py-4 md:[padding-top:1rem]",
        PAGE_GUTTER,
      )}
    >
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
