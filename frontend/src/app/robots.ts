import { getSiteUrl } from "@/config/site";
import type { MetadataRoute } from "next";

/** Routes that require sign-in and must not be crawled. */
const PRIVATE_ROUTE_PREFIXES = [
  "/feed",
  "/explore",
  "/messages",
  "/notifications",
  "/profile",
  "/settings",
] as const;

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        ...PRIVATE_ROUTE_PREFIXES,
        "/reset-password",
        "/api/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
