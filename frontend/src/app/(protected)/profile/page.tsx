"use client";

import { ProfileView } from "@/components/features/profile";
import { useAuthUser } from "@/store";

/** `/profile` — signed-in user's own profile (no redirect loop). */
export default function OwnProfilePage() {
  const user = useAuthUser();
  if (!user?.id) return null;
  return <ProfileView userId={user.id} />;
}
