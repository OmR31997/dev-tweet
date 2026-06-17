"use client";

import {
  MOBILE_NAV_ORDER,
  MOBILE_TOOL_NAV_IDS,
  useNavItems,
  type NavItem,
} from "@/components/layout/useNavItems";
import { cn } from "@/lib/utils";
import { Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

const toolIdSet = new Set<string>(MOBILE_TOOL_NAV_IDS);

function NavTab({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground",
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
}

/** Bottom tab bar — shown on mobile only (below md). */
export function MobileNav() {
  const pathname = usePathname();
  const items = useNavItems();
  const t = useTranslations("Nav");
  const [toolsOpen, setToolsOpen] = useState(false);

  const itemById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const toolItems = MOBILE_TOOL_NAV_IDS.map((id) => itemById.get(id)).filter(
    (item): item is NavItem => item != null,
  );
  const toolsActive = toolItems.some((item) => item.match(pathname));

  useEffect(() => {
    setToolsOpen(false);
  }, [pathname]);

  // Immersive conversation / roadmap viewer: hide the tab bar.
  if (
    /^\/messages\/.+/.test(pathname) ||
    /^\/roadmaps\/.+/.test(pathname) ||
    pathname.startsWith("/course") ||
    pathname.startsWith("/learn-git")
  ) {
    return null;
  }

  return (
    <nav className="relative flex shrink-0 items-stretch border-t border-border bg-background md:hidden">
      {toolsOpen ? (
        <>
          <button
            type="button"
            aria-label={t("closeTools")}
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setToolsOpen(false)}
          />
          <div
            role="menu"
            aria-label={t("toolsMenu")}
            className="absolute inset-x-3 bottom-full z-50 mb-2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
          >
            {toolItems.map((item, index) => {
              const active = item.match(pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setToolsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent",
                    index > 0 && "border-t border-border",
                    active && "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </>
      ) : null}

      {MOBILE_NAV_ORDER.map((slot) => {
        if (slot === "tools") {
          return (
            <button
              key="tools"
              type="button"
              aria-haspopup="menu"
              aria-expanded={toolsOpen}
              onClick={() => setToolsOpen((open) => !open)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                toolsActive || toolsOpen
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              <Wrench className="size-5" />
              {t("tools")}
            </button>
          );
        }

        const item = itemById.get(slot);
        if (!item || toolIdSet.has(item.id)) return null;
        return (
          <NavTab key={item.id} item={item} active={item.match(pathname)} />
        );
      })}
    </nav>
  );
}
