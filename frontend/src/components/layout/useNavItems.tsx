"use client";

import { useNotifications, useUnreadMessageCount } from "@/lib/api";
import {
  Bell,
  Compass,
  GitBranch,
  GraduationCap,
  Home,
  Map,
  MessageCircle,
  User,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
  badge?: number;
}

/** Learning resources grouped under the mobile Tools tab. */
export const MOBILE_TOOL_NAV_IDS = ["roadmaps", "course", "learn-git"] as const;

/** Mobile bottom bar order — `tools` opens the learning submenu. */
export const MOBILE_NAV_ORDER = [
  "feed",
  "explore",
  "tools",
  "notifications",
  "messages",
  "profile",
] as const;

/** Shared navigation items used by the desktop rail and mobile tab bar. */
export function useNavItems(): NavItem[] {
  const t = useTranslations("Nav");
  const unread = useUnreadMessageCount();
  const notifications = useNotifications();
  const unreadNotifications =
    notifications.data?.filter((n) => !n.read).length ?? 0;

  return [
    {
      id: "feed",
      label: t("feed"),
      href: "/feed",
      icon: Home,
      match: (p) => p === "/feed",
    },
    {
      id: "explore",
      label: t("explore"),
      href: "/explore",
      icon: Compass,
      match: (p) => p.startsWith("/explore"),
    },
    {
      id: "roadmaps",
      label: t("roadmaps"),
      href: "/roadmaps",
      icon: Map,
      match: (p) => p.startsWith("/roadmaps"),
    },
    {
      id: "course",
      label: t("course"),
      href: "/course",
      icon: GraduationCap,
      match: (p) => p.startsWith("/course"),
    },
    {
      id: "learn-git",
      label: t("learnGit"),
      href: "/learn-git",
      icon: GitBranch,
      match: (p) => p.startsWith("/learn-git"),
    },
    {
      id: "notifications",
      label: t("notifications"),
      href: "/notifications",
      icon: Bell,
      match: (p) => p.startsWith("/notifications"),
      badge: unreadNotifications,
    },
    {
      id: "messages",
      label: t("messages"),
      href: "/messages",
      icon: MessageCircle,
      match: (p) => p.startsWith("/messages"),
      badge: unread.data ?? 0,
    },
    {
      id: "profile",
      label: t("profile"),
      href: "/profile",
      icon: User,
      match: (p) => p.startsWith("/profile"),
    },
  ];
}
