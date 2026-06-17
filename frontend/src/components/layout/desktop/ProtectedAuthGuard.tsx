"use client";

import { refreshAccessToken } from "@/lib/api/client";
import { isAccessTokenExpired } from "@/lib/api/auth-token";
import { useAuthHasHydrated, useAccessToken } from "@/store";
import { useAuthStore } from "@/store/slices/auth.slice";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * Redirects signed-out users away from protected routes (e.g. /chat).
 * Silently refreshes when the access token expired but a refresh token exists.
 */
export function ProtectedAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthHasHydrated();
  const accessToken = useAccessToken();
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    let cancelled = false;

    const bootstrap = async () => {
      if (accessToken && !isAccessTokenExpired(accessToken)) {
        if (!cancelled) setSessionReady(true);
        return;
      }

      if (!refreshToken) {
        router.replace("/login");
        return;
      }

      const refreshed = await refreshAccessToken();
      if (cancelled) return;

      if (!refreshed) {
        router.replace("/login");
        return;
      }

      setSessionReady(true);
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [hasHydrated, accessToken, refreshToken, router]);

  if (!hasHydrated || !sessionReady) {
    return null;
  }

  return <>{children}</>;
}
