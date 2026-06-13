/** Site-wide SEO and PWA metadata */
export const site = {
  name: "DevTweetHub",
  shortName: "DevTweetHub",
  /** Default document title when no page title is set */
  title: "DevTweetHub — Developer community feed & DMs",
  description:
    "DevTweetHub is a calm space for developers: share updates, snippets, and links in a community feed, follow peers, and message your cohort.",
  tagline: "Where developers connect",
  keywords: [
    "DevTweetHub",
    "DevTweet Hub",
    "developer community",
    "developer social network",
    "engineering feed",
    "tech posts",
    "developer profiles",
    "direct messages",
    "developer DMs",
  ],
  locale: "en_US",
  themeColor: "#0abab5",
  backgroundColor: "#ffffff",
  /** Production canonical origin (override with NEXT_PUBLIC_APP_URL). */
  productionUrl: "https://devtweethub.web.app",
  twitter: {
    card: "summary_large_image" as const,
  },
} as const;

export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? process.env.VERCEL_URL.startsWith("http")
        ? process.env.VERCEL_URL
        : `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? site.productionUrl
        : "http://localhost:3000");

  return url.replace(/\/$/, "");
}

export function getAbsoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}
