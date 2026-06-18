"use client";

import { FollowButton } from "@/components/common/FollowButton";
import { useUser } from "@/lib/api";
import { useAuthUser } from "@/store";

export function PostAuthorFollowButton({ authorId }: { authorId: string }) {
  const me = useAuthUser();
  const author = useUser(me?.id === authorId ? undefined : authorId);

  if (!author.data) return null;

  return <FollowButton target={author.data} />;
}
