"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { Input } from "@/components/ui/input";
import { useUsers } from "@/lib/api";
import { useDebouncedValue } from "@/lib/use-debounce";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function MessagesSidebar() {
  const me = useAuthUser();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const q = useDebouncedValue(query.trim(), 300);
  const users = useUsers(q || undefined);

  const people = (users.data ?? []).filter((u) => u.id !== me?.id);

  return (
    <div className="flex h-full w-full flex-col border-r border-border bg-card">
      <div className="border-b border-border px-4 py-4">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Messages</h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people…"
            className="h-9 pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {users.isLoading ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">Loading…</p>
        ) : people.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">
            No people found.
          </p>
        ) : (
          people.map((user) => {
            const active = pathname === `/messages/${user.id}`;
            return (
              <Link
                key={user.id}
                href={`/messages/${user.id}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-accent",
                  active && "bg-primary/10"
                )}
              >
                <UserAvatar
                  name={user.displayName}
                  photoURL={user.photoURL}
                  className="size-9"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {user.displayName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {user.branch || user.email}
                  </span>
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
