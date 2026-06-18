"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import {
  useArchivedChatCount,
  useConversations,
  useDmChats,
  usePresenceBulk,
  useUsers,
} from "@/lib/api";
import { chatListTime } from "@/lib/format";
import { useDebouncedValue } from "@/lib/use-debounce";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import { Archive, MessageCirclePlus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { NewChatDialog } from "./NewChatDialog";

function matchesQuery(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase());
}

type InboxRow = {
  key: string;
  href: string;
  title: string;
  preview: string;
  time: string;
  sortAt: number;
  kind: "dm" | "group";
  photoURL?: string;
  displayName?: string;
  peerUserId?: string;
};

export function MessagesSidebar() {
  const t = useTranslations("Chat");
  const tc = useTranslations("Common");
  const pathname = usePathname();
  const me = useAuthUser();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const q = useDebouncedValue(query.trim(), 300, { flushOnEmpty: true });
  const groups = useConversations(showArchived);
  const dmChats = useDmChats(showArchived);
  const archivedCount = useArchivedChatCount();
  const users = useUsers(q || undefined, 25, {
    enabled: !showArchived,
    searchOnly: true,
  });

  const groupItems = groups.data ?? [];
  const dmItems = dmChats.data ?? [];
  const archivedTotal = archivedCount.data?.total ?? 0;

  const inboxRows = useMemo(() => {
    const rows: InboxRow[] = [];

    for (const group of groupItems) {
      const sortAt = group.updatedAt
        ? Date.parse(group.updatedAt)
        : Date.parse(group.createdAt);
      rows.push({
        key: `group-${group.id}`,
        href: `/messages/group/${group.id}`,
        title: group.title || t("untitledGroup"),
        preview:
          group.description ||
          t("participantsCount", { count: group.participants.length }),
        time: chatListTime(group.updatedAt ?? group.createdAt),
        sortAt: Number.isFinite(sortAt) ? sortAt : 0,
        kind: "group",
      });
    }

    for (const chat of dmItems) {
      const sortAt = Date.parse(chat.lastMessageAt);
      rows.push({
        key: `dm-${chat.peerUserId}`,
        href: `/messages/${chat.peerUserId}`,
        title: chat.displayName,
        preview: chat.lastMessage || t("noMessagesYet"),
        time: chatListTime(chat.lastMessageAt),
        sortAt: Number.isFinite(sortAt) ? sortAt : 0,
        kind: "dm",
        photoURL: chat.photoURL,
        displayName: chat.displayName,
        peerUserId: chat.peerUserId,
      });
    }

    return rows.sort((a, b) => b.sortAt - a.sortAt);
  }, [groupItems, dmItems, t]);

  const filteredRows = useMemo(() => {
    if (!q) return inboxRows;
    return inboxRows.filter(
      (row) =>
        matchesQuery(row.title, q) || matchesQuery(row.preview, q),
    );
  }, [inboxRows, q]);

  const existingDmPeerIds = useMemo(
    () => new Set(dmItems.map((chat) => chat.peerUserId)),
    [dmItems],
  );

  const newPeople = useMemo(() => {
    if (!q || showArchived) return [];
    return (users.data ?? []).filter(
      (user) => user.id !== me?.id && !existingDmPeerIds.has(user.id),
    );
  }, [users.data, q, showArchived, me?.id, existingDmPeerIds]);

  const isLoading = dmChats.isLoading || groups.isLoading;
  const searchingUsers = Boolean(q && !showArchived);
  const usersLoading = searchingUsers && users.isLoading;
  const hasResults = filteredRows.length > 0 || newPeople.length > 0;

  const dmPeerIds = useMemo(
    () => dmItems.map((chat) => chat.peerUserId),
    [dmItems],
  );
  const presenceBulk = usePresenceBulk(dmPeerIds);
  const onlineByUserId = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const item of presenceBulk.data ?? []) {
      map.set(item.userId, item.online);
    }
    return map;
  }, [presenceBulk.data]);

  return (
    <>
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden border-r border-border bg-card">
        <div className="chat-inbox-header border-b border-border px-4 pb-4">
          {showArchived ? (
            <button
              type="button"
              onClick={() => {
                setShowArchived(false);
                setQuery("");
              }}
              className="chat-archived-header mb-3"
            >
              <span className="chat-archived-back-chevron" aria-hidden>
                ‹
              </span>
              <span className="chat-archived-title">{t("archived")}</span>
            </button>
          ) : (
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold tracking-tight">{t("title")}</h2>
              <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
                <Users className="size-4" />
                {t("group")}
              </Button>
            </div>
          )}
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              showArchived ? t("searchArchivedChats") : t("searchChatsOrContacts")
            }
            className="h-9"
          />
        </div>

        <div className="chat-list-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[var(--mobile-nav-safe-height)] md:pb-0">
          {!showArchived && archivedTotal > 0 ? (
            <button
              type="button"
              onClick={() => setShowArchived(true)}
              className="chat-archived-row px-4"
            >
              <Archive className="size-4 shrink-0" />
              <span className="chat-archived-label">{t("archived")}</span>
              <span className="chat-archived-count">{archivedTotal}</span>
            </button>
          ) : null}

          {isLoading && !q ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">{tc("loading")}</p>
          ) : !hasResults && !usersLoading ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {showArchived
                  ? q
                    ? t("noArchivedSearchResults")
                    : t("noArchivedChats")
                  : q
                    ? t("noChatsOrContacts")
                    : t("noChats")}
              </p>
              {!showArchived && !q ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("tapNewChatHint")}
                </p>
              ) : null}
            </div>
          ) : (
            <>
              {filteredRows.map((row) => {
                const active = pathname === row.href;
                return (
                  <Link
                    key={row.key}
                    href={row.href}
                    className={cn(
                      "chat-list-row flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent",
                      active && "bg-primary/10",
                    )}
                  >
                    {row.kind === "group" ? (
                      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Users className="size-5" />
                      </div>
                    ) : (
                      <UserAvatar
                        name={row.displayName}
                        photoURL={row.photoURL}
                        className="size-11"
                        showOnline={
                          row.peerUserId
                            ? onlineByUserId.get(row.peerUserId)
                            : false
                        }
                      />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {row.title}
                        </span>
                        {row.time ? (
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {row.time}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {row.preview}
                      </span>
                    </span>
                  </Link>
                );
              })}

              {newPeople.length > 0 ? (
                <>
                  <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("people")}
                  </p>
                  {newPeople.map((user) => {
                    const href = `/messages/${user.id}`;
                    const active = pathname === href;
                    return (
                      <Link
                        key={`user-${user.id}`}
                        href={href}
                        className={cn(
                          "chat-list-row flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent",
                          active && "bg-primary/10",
                        )}
                      >
                        <UserAvatar
                          name={user.displayName}
                          photoURL={user.photoURL}
                          className="size-11"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {user.displayName}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {user.branch || user.email}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </>
              ) : null}

              {usersLoading ? (
                <p className="px-4 py-4 text-sm text-muted-foreground">
                  {t("searchingContacts")}
                </p>
              ) : null}
            </>
          )}
        </div>

        {!showArchived ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-[var(--mobile-nav-safe-height)] flex justify-end p-4 md:bottom-0">
            <button
              type="button"
              onClick={() => setNewChatOpen(true)}
              className="pointer-events-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
              aria-label={t("newChat")}
            >
              <MessageCirclePlus className="size-6" />
            </button>
          </div>
        ) : null}
      </div>

      <CreateGroupDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <NewChatDialog open={newChatOpen} onClose={() => setNewChatOpen(false)} />
    </>
  );
}
