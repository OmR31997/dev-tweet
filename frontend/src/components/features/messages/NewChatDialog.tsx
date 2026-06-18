"use client";

import { UserAvatar } from "@/components/common/UserAvatar";
import { SearchInput } from "@/components/common/SearchInput";
import { useUsers } from "@/lib/api";
import { useSearchQuery } from "@/lib/use-search-query";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export function NewChatDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("Chat");
  const tc = useTranslations("Common");
  const me = useAuthUser();
  const router = useRouter();
  const { query, setQuery, q } = useSearchQuery(open);
  const users = useUsers(q || undefined, 25, { enabled: open, searchOnly: true });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const people = (users.data ?? []).filter((u) => u.id !== me?.id);

  const startChat = (userId: string) => {
    onClose();
    router.push(`/messages/${userId}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-lg font-semibold">{t("newChatTitle")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent"
            aria-label={tc("close")}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <SearchInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchContacts")}
            className="h-10"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {users.isLoading ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">{tc("loading")}</p>
          ) : people.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted-foreground">
              {q ? t("noContactsFound") : t("searchSomeone")}
            </p>
          ) : (
            people.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => startChat(user.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent",
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
                  <span className="block truncate text-xs text-muted-foreground">
                    {user.branch || user.email}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
