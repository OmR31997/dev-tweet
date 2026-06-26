import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Shared horizontal padding for page headers and content sections. */
export const PAGE_GUTTER = "px-5 md:px-6";

interface PageLayoutProps {
  header: ReactNode;
  children: ReactNode;
  className?: string;
  maxWidth?: "2xl" | "3xl";
}

/** Pins the page header while the body scrolls inside the app shell. */
export function PageLayout({
  header,
  children,
  className,
  maxWidth = "3xl",
}: PageLayoutProps) {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 flex-col">
      <div
        className={cn(
          "mx-auto flex h-full min-h-0 w-full min-w-0 flex-1 flex-col",
          maxWidth === "3xl" ? "max-w-3xl" : "max-w-2xl",
          className,
        )}
      >
        {header}
        <div data-app-scroll-root className="app-page-scroll min-h-0 min-w-0 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
