import { AUTH_TOKEN_KEY } from "@/config/auth";
import { authActions } from "@/store/action";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return authActions.getAccessToken() ?? localStorage.getItem(AUTH_TOKEN_KEY);
}

export function hasAuthToken(): boolean {
  return Boolean(getAuthToken());
}

/** Decode a JWT payload (no verification). Browser-safe base64url. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("binary");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** The canonical current user id (JWT `sub`) — used to attribute messages. */
export function getCurrentUserId(): string | null {
  const storeId = authActions.getUser()?.id;
  if (storeId) return storeId;

  const token = getAuthToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  const sub = payload?.sub ?? payload?.user_id ?? payload?.userId;
  return sub ? String(sub) : null;
}

export { AUTH_TOKEN_KEY };
