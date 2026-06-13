import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

function normalizePrefix(prefix: string) {
  return prefix.startsWith("/") ? prefix : `/${prefix}`;
}

// Mirror of `API_INGRESS_HOST` in src/config/api-infrastructure.ts — next.config
// cannot import app TS modules, so the default is duplicated here.
const DEFAULT_INGRESS_HOST =
  "http://k8s-ingressn-ingressn-a7b587dfee-d7fa6c49f98c4941.elb.ap-south-1.amazonaws.com:80";

const apiPrefix = normalizePrefix(
  process.env.API_PREFIX ?? process.env.NEXT_PUBLIC_API_PREFIX ?? "/api"
);

const apiUpstreamOrigin = (
  process.env.API_INGRESS_URL ??
  process.env.API_URL ??
  process.env.NEST_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  DEFAULT_INGRESS_HOST
).replace(/\/$/, "");

// When false, the proxy strips `/api` before forwarding (the AWS ingress carries
// the service segment in the path itself, e.g. /user-service/api/v1/...).
const upstreamUsesApiPrefix =
  (process.env.API_UPSTREAM_USES_API_PREFIX ?? "false") === "true";

const upstreamPrefix = upstreamUsesApiPrefix ? apiPrefix : "";

const nextConfig: NextConfig = {
  images: {
    // Known avatar/media hosts. User-provided avatar URLs from arbitrary hosts
    // are rendered with a plain <img>, so this list need not be exhaustive.
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
