import { AUTH_TOKEN_KEY } from "@/config/auth";
import { getClientApiBaseUrl } from "@/config/env";
import { authActions } from "@/store/action";
import axios, { type InternalAxiosRequestConfig } from "axios";
import { API_ENDPOINTS } from "./endpoints";
import { toApiError } from "./errors";
import { normalizeAuthResponse } from "./normalizers";

/**
 * Browser-facing API client.
 * Requests go to `/api/*` on the Next.js origin and are proxied to the
 * DevTweetHub NestJS backend (see `next.config.ts`).
 */
export const apiClient = axios.create({
  baseURL: getClientApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30_000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      authActions.getAccessToken() ?? localStorage.getItem(AUTH_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

const isAuthEndpoint = (url?: string) => Boolean(url?.includes("/auth/"));

/**
 * Exchange the stored refresh token for a fresh session.
 * `POST /auth/refresh` takes `{ refreshToken }` and returns a new
 * `{ accessToken, refreshToken, user }`.
 * Uses bare axios (not `apiClient`) to skip the access-token interceptor.
 */
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = authActions.getState().refreshToken;
  if (!refreshToken) {
    return false;
  }

  try {
    const { data } = await axios.post(
      `${getClientApiBaseUrl()}${API_ENDPOINTS.auth.refresh}`,
      { refreshToken },
      { timeout: 30_000 }
    );
    authActions.setSession(normalizeAuthResponse(data));
    return true;
  } catch {
    return false;
  }
}

/** De-duplicated refresh: concurrent 401s share one refresh round-trip. */
let refreshPromise: Promise<boolean> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint(original.url)
    ) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken();
      const refreshed = await refreshPromise;
      refreshPromise = null;

      if (refreshed) {
        const token = authActions.getAccessToken();
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(original);
      }

      authActions.clearSession();
    }

    return Promise.reject(toApiError(error));
  }
);
