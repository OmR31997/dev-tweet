"use client";

import { useAuthHasHydrated, useAuthUser } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** `/profile` → redirect to the signed-in user's own profile. */
export default function OwnProfilePage() {
  const router = useRouter();
  const hasHydrated = useAuthHasHydrated();
  const user = useAuthUser();

  useEffect(() => {
    if (hasHydrated && user?.id) {
      router.replace(`/profile/${user.id}`);
    }
  }, [hasHydrated, user?.id, router]);

  return (
    <div className="grid h-full place-items-center text-sm text-muted-foreground">
      Loading your profile…
    </div>
  );
}
