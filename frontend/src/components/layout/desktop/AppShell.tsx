"use client";

import { isFillRoute, isMobileNavHidden } from "@/lib/app-shell-routes";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ChatNavRail } from "./ChatNavRail";
import { MobileNav } from "./MobileNav";

/** Locks document scroll on mobile PWA so only the main pane scrolls. */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const fillRoute = isFillRoute(pathname);
  const hideMobileNav = isMobileNavHidden(pathname);

  useEffect(() => {
    document.documentElement.classList.add("app-scroll-lock");
    document.body.classList.add("app-scroll-lock");
    return () => {
      document.documentElement.classList.remove("app-scroll-lock");
      document.body.classList.remove("app-scroll-lock");
    };
  }, []);

  return (
    <div className="app-shell">
      <ChatNavRail />
      <div className="app-shell-column">
        <main
          {...(!fillRoute ? { "data-app-scroll-root": true } : {})}
          className={cn(
            fillRoute ? "app-main-fill" : "app-main-scroll",
            !fillRoute && hideMobileNav && "max-md:!pb-0",
          )}
        >
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
