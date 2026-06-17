import { getSiteUrl } from "@/config/site";
import type { MetadataRoute } from "next";

/** Public, indexable marketing and auth entry pages. */
const PUBLIC_ROUTES = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/login", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/register", changeFrequency: "monthly" as const, priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
