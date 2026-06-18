import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import {
  DEFAULT_API_ORIGIN,
  DEFAULT_API_PREFIX,
} from "./src/config/defaults";

function normalizePrefix(prefix: string) {
  return prefix.startsWith("/") ? prefix : `/${prefix}`;
}

function readBool(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value !== "false" && value !== "0";
}

const apiPrefix = normalizePrefix(
  process.env.API_PREFIX ?? process.env.NEXT_PUBLIC_API_PREFIX ?? DEFAULT_API_PREFIX,
);

const useMicroservices = readBool(process.env.API_USE_MICROSERVICES, false);

function resolveApiUpstreamOrigin(): string {
  const fromEnv =
    process.env.API_INGRESS_URL ??
    process.env.API_URL ??
    process.env.NEST_API_URL ??
    process.env.NEXT_PUBLIC_API_URL;

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (useMicroservices) {
    throw new Error(
      "Set API_INGRESS_URL or API_URL when API_USE_MICROSERVICES=true",
    );
  }

  return DEFAULT_API_ORIGIN;
}

const apiUpstreamOrigin = resolveApiUpstreamOrigin();

const upstreamUsesApiPrefix =
  (process.env.API_UPSTREAM_USES_API_PREFIX ?? "false") === "true";

const upstreamPrefix = upstreamUsesApiPrefix ? apiPrefix : "";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "chat-uae-bucket.s3.ap-south-1.amazonaws.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/favicon.ico",
        destination: "/icon",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: `${apiPrefix}/:path*`,
        destination: `${apiUpstreamOrigin}${upstreamPrefix}/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
