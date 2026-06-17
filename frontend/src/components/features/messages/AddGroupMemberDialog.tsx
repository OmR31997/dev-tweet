"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Input } from "@/components/ui/input";
import { getErrorMessage, useAddGroupMember, useUsers } from "@/lib/api";
import { useSearchQuery } from "@/lib/use-search-query";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

export function AddGroupMemberDialog({
  open,
  onClose,
  conversationId,
  existingParticipantIds,
}: {
  open: boolean;
  onClose: () => void;
  conversationId: string;
  existingParticipantIds: string[];
}) {
  const me = useAuthUser();
  const addMember = useAddGroupMember(conversationId);
  const [error, setError] = useState<string | null>(null);
  const { query, setQuery, q } = useSearchQuery(open);
  const users = useUsers(q || undefined, 25, { enabled: open, searchOnly: true });

  useEffect(() => {
    if (!open) return;
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const existing = new Set(existingParticipantIds);
  const people = (users.data ?? []).filter(
    (user) => user.id !== me?.id && !existing.has(user.id),
  );

  const onAdd = (userId: string) => {
    setError(null);
    addMember.mutate(userId, {
      onSuccess: () => onClose(),
      onError: (err) => setError(getErrorMessage(err)),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">Add member</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contacts…"
              className="h-10 pl-9"
              autoFocus
            />
          </div>
          {error ? (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {users.isLoading ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">Loading…</p>
          ) : people.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {q ? "No contacts found." : "Search for someone to add."}
            </p>
          ) : (
            <ul>
              {people.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    disabled={addMember.isPending}
                    onClick={() => onAdd(user.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent",
                      addMember.isPending && "opacity-60",
                    )}
                  >
                    <UserAvatar
                      name={user.displayName}
                      photoURL={user.photoURL}
                      className="size-10"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {user.displayName}
                      </span>
                      {user.branch ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {user.branch}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
