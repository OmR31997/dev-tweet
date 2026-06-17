"use client";

import { UserRow } from "@/components/common/UserRow";
import { FollowButton } from "@/components/common/FollowButton";
import { Input } from "@/components/ui/input";
import {
  useFollowers,
  useFollowing,
} from "@/lib/api";
import { useDebouncedValue } from "@/lib/use-debounce";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type FollowListTab = "followers" | "following";

export function FollowListDialog({
  open,
  onClose,
  userId,
  displayName,
  tab,
  followerCount,
  followingCount,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  displayName: string;
  tab: FollowListTab;
  followerCount: number;
  followingCount: number;
}) {
  const [activeTab, setActiveTab] = useState<FollowListTab>(tab);
  const [query, setQuery] = useState("");
  const q = useDebouncedValue(query.trim(), 250, { flushOnEmpty: true });
  const followers = useFollowers(open ? userId : undefined);
  const following = useFollowing(open ? userId : undefined);

  useEffect(() => {
    if (open) {
      setActiveTab(tab);
      setQuery("");
    }
  }, [open, tab]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const users = useMemo(() => {
    const list =
      activeTab === "followers" ? (followers.data ?? []) : (following.data ?? []);
    if (!q) return list;
    const needle = q.toLowerCase();
    return list.filter(
      (user) =>
        user.displayName.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle) ||
        (user.branch ?? "").toLowerCase().includes(needle),
    );
  }, [activeTab, followers.data, following.data, q]);

  const isLoading =
    activeTab === "followers" ? followers.isLoading : following.isLoading;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{displayName}</h2>
            <p className="truncate text-xs text-muted-foreground">
              {activeTab === "followers" ? "Followers" : "Following"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-border">
          {(
            [
              ["followers", followerCount] as const,
              ["following", followingCount] as const,
            ] as const
          ).map(([key, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={cn(
                "border-b-2 px-4 py-3 text-sm font-semibold capitalize transition-colors",
                activeTab === key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {key} · {count}
            </button>
          ))}
        </div>

        <div className="border-b border-border px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-9 rounded-lg bg-muted/50 pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : users.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {q
                ? "No accounts found."
                : activeTab === "followers"
                  ? "No followers yet."
                  : "Not following anyone yet."}
            </p>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                action={<FollowButton target={user} />}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
