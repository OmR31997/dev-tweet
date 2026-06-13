"use client";

import { useAuthHasHydrated, useIsAuthenticated } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/**
 * Redirects signed-out users away from protected routes (e.g. /chat).
 */
export function ProtectedAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthHasHydrated();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  return children;
}
