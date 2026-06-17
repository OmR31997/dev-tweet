"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useNavItems } from "@/components/layout/useNavItems";
import { useLogout } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import {
  ChevronsUpDown,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

/** Left navigation rail — shown on tablet/desktop (md+). */
export function ChatNavRail() {
  const t = useTranslations("Nav");
  const tc = useTranslations("Common");
  const pathname = usePathname();
  const logout = useLogout();
  const user = useAuthUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useNavItems();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-border bg-background md:flex">
      <Link
        href="/feed"
        className="flex items-center gap-2 px-6 py-5 text-lg font-bold tracking-tight"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          D
        </span>
        DevTweetHub
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/70 hover:bg-accent hover:text-foreground"
              )}
            >
              <span className="relative">
                <Icon className="size-5" />
                {item.badge ? (
                  <span className="absolute -right-2 -top-2 grid min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative border-t border-border p-3">
        {menuOpen ? (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute inset-x-3 bottom-full z-20 mb-2 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                <UserIcon className="size-4" />
                {t("viewProfile")}
              </Link>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Settings className="size-4" />
                {t("settings")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmOpen(true);
                }}
                disabled={logout.isPending}
                className="flex w-full items-center gap-3 border-t border-border px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-accent"
              >
                <LogOut className="size-4" />
                {t("signOut")}
              </button>
            </div>
          </>
        ) : null}

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent"
        >
          <UserAvatar
            name={user?.displayName}
            photoURL={user?.photoURL}
            className="size-9"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {user?.displayName ?? tc("you")}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={t("signOutTitle")}
        message={t("signOutMessage")}
        confirmLabel={t("signOut")}
        cancelLabel={t("cancel")}
        destructive
        busy={logout.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() =>
          logout.mutate(undefined, { onSettled: () => setConfirmOpen(false) })
        }
      />
    </aside>
  );
}
