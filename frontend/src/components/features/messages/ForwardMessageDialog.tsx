"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversations, useUsers } from "@/lib/api";
import { useSearchQuery } from "@/lib/use-search-query";
import { useAuthUser } from "@/store";
import { Search, Users, X } from "lucide-react";

export function ForwardMessageDialog({
  open,
  messageIds,
  busy,
  onClose,
  onForward,
}: {
  open: boolean;
  messageIds: string[];
  busy?: boolean;
  onClose: () => void;
  onForward: (target: { recipientId?: string; conversationId?: string }) => void;
}) {
  const me = useAuthUser();
  const groups = useConversations();
  const { query, setQuery, q } = useSearchQuery(open);
  const users = useUsers(q || undefined, 25, { enabled: open, searchOnly: true });

  if (!open) return null;

  const people = (users.data ?? []).filter((u) => u.id !== me?.id);
  const groupItems = groups.data ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">Forward message</h2>
            <p className="text-sm text-muted-foreground">
              {messageIds.length} selected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-border px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats…"
              className="h-9 pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {groupItems.length > 0 ? (
            <>
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Groups
              </p>
              {groupItems.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  disabled={busy}
                  onClick={() => onForward({ conversationId: group.id })}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent"
                >
                  <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                    <Users className="size-4" />
                  </div>
                  <span className="truncate text-sm font-medium">
                    {group.title || "Untitled group"}
                  </span>
                </button>
              ))}
            </>
          ) : null}

          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            People
          </p>
          {people.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              No chats found.
            </p>
          ) : (
            people.map((user) => (
              <button
                key={user.id}
                type="button"
                disabled={busy}
                onClick={() => onForward({ recipientId: user.id })}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent"
              >
                <UserAvatar
                  name={user.displayName}
                  photoURL={user.photoURL}
                  className="size-9"
                />
                <span className="truncate text-sm font-medium">
                  {user.displayName}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="border-t border-border px-5 py-3">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
