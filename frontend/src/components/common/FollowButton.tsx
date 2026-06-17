"use client";

import { Button } from "@/components/ui/button";
import { useToggleFollow, type AuthUser } from "@/lib/api";
import { getFollowRelationship } from "@/lib/follow.utils";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";

export function FollowButton({
  target,
  size = "sm",
  className,
  onClick,
  hideWhenFollowing = false,
}: {
  target: Pick<AuthUser, "id" | "followers" | "following">;
  size?: "sm" | "default";
  className?: string;
  onClick?: () => void;
  hideWhenFollowing?: boolean;
}) {
  const me = useAuthUser();
  const toggleFollow = useToggleFollow();
  const relationship = getFollowRelationship(me?.id, target);

  if (relationship.isSelf) return null;
  if (hideWhenFollowing && relationship.isFollowing) return null;

  const busy = toggleFollow.isPending;

  return (
    <Button
      type="button"
      size={size}
      variant={relationship.isFollowing ? "outline" : "default"}
      className={cn(
        size === "sm" && "h-8 rounded-lg px-4 text-xs font-semibold",
        className,
      )}
      disabled={busy}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFollow.mutate(target.id, { onSuccess: () => onClick?.() });
      }}
    >
      {relationship.label}
    </Button>
  );
}
