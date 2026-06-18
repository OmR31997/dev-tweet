"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { SearchInput } from "@/components/common/SearchInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getErrorMessage, useCreateGroup, useUsers } from "@/lib/api";
import { useSearchQuery } from "@/lib/use-search-query";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CreateGroupDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const me = useAuthUser();
  const router = useRouter();
  const createGroup = useCreateGroup();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<
    Array<{ id: string; displayName: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const { query, setQuery, q } = useSearchQuery(open);
  const users = useUsers(q || undefined, 25, { enabled: open, searchOnly: true });

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setSelected([]);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const people = (users.data ?? []).filter((u) => u.id !== me?.id);
  const selectedIds = selected.map((u) => u.id);

  const toggleUser = (userId: string, displayName: string) => {
    setSelected((prev) =>
      prev.some((u) => u.id === userId)
        ? prev.filter((u) => u.id !== userId)
        : [...prev, { id: userId, displayName }],
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selected.length === 0) return;
    createGroup.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        participantIds: selectedIds,
      },
      {
        onSuccess: (group) => {
          onClose();
          router.push(`/messages/group/${group.id}`);
        },
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Create group</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a title, description, and members.
          </p>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Group title"
            maxLength={100}
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Group description (optional)"
            maxLength={500}
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-transparent p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />

          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selected.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleUser(user.id, user.displayName)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {user.displayName}
                  <X className="size-3" />
                </button>
              ))}
            </div>
          ) : null}

          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people to add…"
            className="h-9"
          />

          <div className="max-h-48 overflow-y-auto rounded-xl border border-border">
            {people.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                No people found.
              </p>
            ) : (
              people.map((user) => {
                const active = selectedIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleUser(user.id, user.displayName)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent",
                      active && "bg-primary/10",
                    )}
                  >
                    <UserAvatar
                      name={user.displayName}
                      photoURL={user.photoURL}
                      className="size-8"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {user.displayName}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {user.branch || user.email}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              createGroup.isPending || !title.trim() || selected.length === 0
            }
          >
            {createGroup.isPending ? "Creating…" : "Create group"}
          </Button>
        </div>
      </form>
    </div>
  );
}
