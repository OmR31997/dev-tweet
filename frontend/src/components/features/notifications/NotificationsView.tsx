"use client";

import { FollowButton } from "@/components/common/FollowButton";
import { PageHeader } from "@/components/common/PageHeader";
import { QueryState } from "@/components/common/QueryState";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  useClearNotifications,
  useMarkNotificationRead,
  useNotifications,
  useUser,
  type AppNotification,
  type NotificationType,
} from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useAuthUser } from "@/store";

function NotificationIcon({ type }: { type: NotificationType }) {
  if (type === "like")
    return <Heart className="size-4 text-destructive" />;
  if (type === "message")
    return <MessageCircle className="size-4 text-primary" />;
  if (type === "follow" || type === "follow_accept")
    return <UserPlus className="size-4 text-primary" />;
  return <Bell className="size-4 text-muted-foreground" />;
}

function hrefFor(n: AppNotification): string {
  if (n.type === "message") return `/messages/${n.senderId}`;
  if (n.type === "follow" || n.type === "follow_accept" || n.type === "unfollow")
    return `/profile/${n.senderId}`;
  return "/feed";
}

function NotificationFollowAction({
  senderId,
  type,
}: {
  senderId: string;
  type: NotificationType;
}) {
  const me = useAuthUser();
  const sender = useUser(type === "follow" ? senderId : undefined);

  if (type !== "follow" || !me || me.id === senderId || !sender.data) {
    return null;
  }

  return <FollowButton target={sender.data} hideWhenFollowing />;
}

function NotificationRow({
  n,
  verb,
}: {
  n: AppNotification;
  verb: string;
}) {
  const markRead = useMarkNotificationRead();
  return (
    <Link
      href={hrefFor(n)}
      onClick={() => {
        if (!n.read) markRead.mutate(n.id);
      }}
      className={cn(
        "flex items-center gap-3 border-b border-border px-5 py-3.5 transition-colors hover:bg-accent/50",
        !n.read && "bg-primary/5",
      )}
    >
      <div className="relative shrink-0">
        <UserAvatar name={n.senderName} />
        <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border-2 border-card bg-card">
          <NotificationIcon type={n.type} />
        </span>
      </div>
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-semibold">{n.senderName}</span>{" "}
        <span className="text-muted-foreground">{verb}</span>
      </p>
      <NotificationFollowAction senderId={n.senderId} type={n.type} />
      <span className="shrink-0 text-xs text-muted-foreground">
        {timeAgo(n.createdAt)}
      </span>
      {!n.read ? (
        <span className="size-2 shrink-0 rounded-full bg-primary" />
      ) : null}
    </Link>
  );
}

export function NotificationsView() {
  const t = useTranslations("Notifications");
  const notifications = useNotifications();
  const clear = useClearNotifications();
  const items = notifications.data ?? [];

  const verbFor = (type: NotificationType) => t(type);

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      <PageHeader
        title={t("title")}
        actions={
          items.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clear.mutate()}
              disabled={clear.isPending}
            >
              {t("clearAll")}
            </Button>
          ) : null
        }
      />

      <QueryState
        isLoading={notifications.isLoading}
        isError={notifications.isError}
        error={notifications.error}
        isEmpty={items.length === 0}
        loadingMessage={t("loading")}
        emptyMessage={t("caughtUp")}
        onRetry={() => notifications.refetch()}
      >
        <div>
          {items.map((n) => (
            <NotificationRow key={n.id} n={n} verb={verbFor(n.type)} />
          ))}
        </div>
      </QueryState>
    </div>
  );
}
