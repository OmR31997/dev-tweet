/**
 * API environment configuration.
 *
 * Browser requests use a relative proxy prefix (e.g. `/api`) and are rewritten
 * to the DevTweetHub NestJS backend via `next.config.ts` — no CORS, no
 * mixed-content, and the upstream host stays server-only.
 */

import {
  DEFAULT_API_ORIGIN,
  DEFAULT_API_PREFIX,
  DEFAULT_APP_ORIGIN,
} from "./defaults";

function trimTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

function normalizePrefix(prefix: string) {
  return prefix.startsWith("/") ? prefix : `/${prefix}`;
}

function readBool(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value !== "false" && value !== "0";
}

const apiPrefix = normalizePrefix(
  process.env.NEXT_PUBLIC_API_PREFIX ?? process.env.API_PREFIX ?? DEFAULT_API_PREFIX,
);

/** Whether the deployment targets a multi-service ingress (vs a single Nest app). */
const useMicroservices = readBool(process.env.API_USE_MICROSERVICES, false);

/**
 * Whether the upstream itself expects the `/api` prefix. For the AWS ingress
 * the service segment carries the path, so the prefix is stripped on rewrite.
 */
const upstreamUsesApiPrefix = readBool(
  process.env.API_UPSTREAM_USES_API_PREFIX,
  false,
);

function resolveApiUpstreamOrigin() {
  const fromEnv =
    process.env.API_INGRESS_URL ??
    process.env.API_URL ??
    process.env.NEST_API_URL ??
    process.env.NEXT_PUBLIC_API_URL;

  if (fromEnv) {
    return trimTrailingSlash(fromEnv);
  }

  if (useMicroservices) {
    throw new Error(
      "Set API_INGRESS_URL or API_URL when API_USE_MICROSERVICES=true",
    );
  }

  return DEFAULT_API_ORIGIN;
}

const apiUpstreamOrigin = resolveApiUpstreamOrigin();

/**
 * Base URL for browser Axios calls.
 *
 * - `NEXT_PUBLIC_API_URL` (optional): call the Nest API directly — best for local
 *   dev so requests show up in the backend terminal (`http://localhost:4000`).
 * - Otherwise use the same-origin `/api` prefix → Next.js rewrite → `API_URL`.
 */
export function getClientApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const direct = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (direct) {
      return trimTrailingSlash(direct);
    }
    return apiPrefix;
  }

  const appOrigin = (() => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.VERCEL_URL) {
      return process.env.VERCEL_URL.startsWith("http")
        ? process.env.VERCEL_URL
        : `https://${process.env.VERCEL_URL}`;
    }

    return DEFAULT_APP_ORIGIN;
  })();

  return `${trimTrailingSlash(appOrigin)}${apiPrefix}`;
}

/** socket.io server — must match backend PORT and CLIENT_ORIGIN in dev. */
export function getSocketUrl(): string {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_SOCKET_URL ?? DEFAULT_API_ORIGIN,
  );
}

export const env = {
  apiPrefix,
  apiUpstreamOrigin,
  useMicroservices,
  upstreamUsesApiPrefix,
  socketUrl: getSocketUrl(),
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : DEFAULT_APP_ORIGIN),
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
} as const;
