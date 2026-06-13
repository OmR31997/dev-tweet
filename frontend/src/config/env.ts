/**
 * API environment configuration.
 *
 * Browser requests use a relative proxy prefix (e.g. `/api`) and are rewritten
 * to the DevTweetHub NestJS backend via `next.config.ts` — no CORS, no
 * mixed-content, and the upstream host stays server-only.
 */

/** Default upstream when no API_URL is provided. */
const DEFAULT_API_ORIGIN = "http://localhost:4000";

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
  process.env.NEXT_PUBLIC_API_PREFIX ?? process.env.API_PREFIX ?? "/api"
);

/** Whether the upstream is the multi-service ingress (vs a single Nest app). */
const useMicroservices = readBool(process.env.API_USE_MICROSERVICES, true);

/**
 * Whether the upstream itself expects the `/api` prefix. For the AWS ingress
 * the service segment carries the path, so the prefix is stripped on rewrite.
 */
const upstreamUsesApiPrefix = readBool(
  process.env.API_UPSTREAM_USES_API_PREFIX,
  false
);

/** Upstream origin — server-only (never required in the browser). */
const apiUpstreamOrigin = trimTrailingSlash(
  process.env.API_URL ??
    process.env.API_INGRESS_URL ??
    process.env.NEST_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_API_ORIGIN
);

/**
 * Base URL for browser Axios calls (same-origin proxy).
 * Example: `/api` → Next.js rewrite → `<ingress>/user-service/api/v1/...`
 */
export function getClientApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return apiPrefix;
  }

  // SSR / server actions: call back through the running Next app proxy.
  const appOrigin = (() => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.VERCEL_URL) {
      return process.env.VERCEL_URL.startsWith("http")
        ? process.env.VERCEL_URL
        : `https://${process.env.VERCEL_URL}`;
    }

    return "http://localhost:3000";
  })();

  return `${trimTrailingSlash(appOrigin)}${apiPrefix}`;
}

export const env = {
  apiPrefix,
  apiUpstreamOrigin,
  useMicroservices,
  upstreamUsesApiPrefix,
  isDev: process.env.NODE_ENV === "development",
} as const;
