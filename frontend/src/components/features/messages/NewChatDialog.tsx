"use client";

import { MobileSheet } from "@/components/common/MobileSheet";
import { UserAvatar } from "@/components/common/UserAvatar";
import { SearchInput } from "@/components/common/SearchInput";
import { useUsers } from "@/lib/api";
import { useSearchQuery } from "@/lib/use-search-query";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

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

  const people = (users.data ?? []).filter((u) => u.id !== me?.id);

  const startChat = (userId: string) => {
    onClose();
    router.push(`/messages/${userId}`);
  };

  return (
    <MobileSheet
      open={open}
      onClose={onClose}
      title={t("newChatTitle")}
      titleId="new-chat-title"
      closeLabel={tc("close")}
      panelClassName="sm:max-w-md"
    >
      <div className="shrink-0 border-b border-border px-4 py-3">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchContacts")}
          className="h-10"
          autoFocus
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
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
    </MobileSheet>
  );
}
