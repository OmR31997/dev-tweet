"use client";

import { refreshAccessToken } from "@/lib/api/client";
import {
  isAccessTokenExpired,
} from "@/lib/api/auth-token";
import { useAuthStore } from "@/store/slices/auth.slice";
import { useAccessToken } from "@/store/selector";
import { useEffect, type ReactNode } from "react";

const REFRESH_LEAD_MS = 60_000;

/**
 * Proactively refreshes the access token shortly before it expires so
 * API calls and the websocket stay authenticated without a 401 round-trip.
 */
export function TokenRefreshProvider({ children }: { children: ReactNode }) {
  const accessToken = useAccessToken();
  const refreshToken = useAuthStore((state) => state.refreshToken);

  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const payload = accessToken.split(".")[1];
    if (!payload) return;

    let refreshIn = REFRESH_LEAD_MS;
    try {
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const json =
        typeof atob === "function"
          ? atob(base64)
          : Buffer.from(base64, "base64").toString("binary");
      const exp = (JSON.parse(json) as { exp?: number }).exp;
      if (typeof exp === "number") {
        refreshIn = Math.max(exp * 1000 - Date.now() - REFRESH_LEAD_MS, 0);
      }
    } catch {
      refreshIn = REFRESH_LEAD_MS;
    }

    const timer = setTimeout(() => {
      if (isAccessTokenExpired(accessToken)) {
        void refreshAccessToken();
      }
    }, refreshIn);

    return () => clearTimeout(timer);
  }, [accessToken, refreshToken]);

  return <>{children}</>;
}
