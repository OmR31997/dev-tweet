"use client";

import { useNavItems } from "@/components/layout/useNavItems";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

/** Bottom tab bar — shown on mobile only (below md). */
export function MobileNav() {
  const pathname = usePathname();
  const items = useNavItems();

  // Immersive conversation view: hide the tab bar on /messages/[id].
  if (/^\/messages\/.+/.test(pathname)) {
    return null;
  }

  return (
    <nav className="flex shrink-0 items-stretch border-t border-border bg-background md:hidden">
      {items.map((item) => {
        const active = item.match(pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <span className="relative">
              <Icon className="size-5" />
              {item.badge ? (
                <span className="absolute -right-2 -top-1.5 grid min-w-3.5 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-white">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
