import type { AuthUser } from "@/lib/api";

export type FollowLabel = "Follow" | "Following" | "Follow back";

export function getFollowRelationship(
  meId: string | undefined,
  target: Pick<AuthUser, "id" | "followers" | "following">,
) {
  if (!meId || meId === target.id) {
    return {
      isSelf: true,
      isFollowing: false,
      followsYou: false,
      isMutual: false,
      label: "Follow" as FollowLabel,
    };
  }

  const isFollowing = (target.followers ?? []).includes(meId);
  const followsYou = (target.following ?? []).includes(meId);
  const isMutual = isFollowing && followsYou;

  let label: FollowLabel;
  if (isFollowing) {
    label = "Following";
  } else if (followsYou) {
    label = "Follow back";
  } else {
    label = "Follow";
  }

  return { isSelf: false, isFollowing, followsYou, isMutual, label };
}
