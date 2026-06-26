import { PAGE_GUTTER } from "@/components/common/PageLayout";
import { UserAvatar } from "@/components/common/UserAvatar";
import type { AuthUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

/** Compact directory row: avatar + name + meta, linking to the profile. */
export function UserRow({
  user,
  action,
}: {
  user: AuthUser;
  action?: ReactNode;
}) {
  const meta = [user.branch, user.college].filter(Boolean).join(" · ");
  return (
    <div className={cn("flex items-center gap-3 py-3 hover:bg-accent/50", PAGE_GUTTER)}>
      <Link href={`/profile/${user.id}`} className="shrink-0">
        <UserAvatar name={user.displayName} photoURL={user.photoURL} />
      </Link>
      <Link href={`/profile/${user.id}`} className="min-w-0 flex-1">
        <span className="block truncate font-medium hover:underline">
          {user.displayName}
        </span>
        <span className="block truncate text-sm text-muted-foreground">
          {meta || user.email}
        </span>
      </Link>
      {action}
    </div>
  );
}
