"use client";

import { useNotifications, useUnreadMessageCount } from "@/lib/api";
import {
  Bell,
  Compass,
  Home,
  MessageCircle,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
  badge?: number;
}

/** Shared navigation items used by the desktop rail and mobile tab bar. */
export function useNavItems(): NavItem[] {
  const unread = useUnreadMessageCount();
  const notifications = useNotifications();
  const unreadNotifications =
    notifications.data?.filter((n) => !n.read).length ?? 0;

  return [
    { id: "feed", label: "Feed", href: "/feed", icon: Home, match: (p) => p === "/feed" },
    {
      id: "explore",
      label: "Explore",
      href: "/explore",
      icon: Compass,
      match: (p) => p.startsWith("/explore"),
    },
    {
      id: "notifications",
      label: "Alerts",
      href: "/notifications",
      icon: Bell,
      match: (p) => p.startsWith("/notifications"),
      badge: unreadNotifications,
    },
    {
      id: "messages",
      label: "Messages",
      href: "/messages",
      icon: MessageCircle,
      match: (p) => p.startsWith("/messages"),
      badge: unread.data ?? 0,
    },
    {
      id: "profile",
      label: "Profile",
      href: "/profile",
      icon: User,
      match: (p) => p.startsWith("/profile"),
    },
  ];
}
