"use client";

import { useAuthHasHydrated, useIsAuthenticated } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/** Sends already-signed-in users away from auth pages (login/register). */
export function AuthRedirectGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthHasHydrated();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace("/feed");
    }
  }, [hasHydrated, isAuthenticated, router]);

  return <>{children}</>;
}
