/** Site-wide SEO and PWA metadata */
import { DEFAULT_APP_ORIGIN } from "./defaults";

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
        ? undefined
        : DEFAULT_APP_ORIGIN);

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is required in production. Set it in your deployment environment.",
    );
  }

  return url.replace(/\/$/, "");
}

export function getAbsoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}
