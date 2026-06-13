import { getAbsoluteUrl, getSiteUrl, site } from "@/config/site";
import type { Metadata } from "next";

type PageMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
};

const defaultOgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
  type: "image/png",
} as const;

export function createPageMetadata(options: PageMetadataOptions = {}): Metadata {
  const {
    title,
    description = site.description,
    path = "",
    noIndex = false,
  } = options;

  const pageTitle = title ? `${title} | ${site.name}` : site.title;
  const url = getAbsoluteUrl(path);

  return {
    title: title
      ? { absolute: pageTitle }
      : { default: site.title, template: `%s | ${site.name}` },
    description,
    keywords: [...site.keywords],
    authors: [{ name: site.name, url: getSiteUrl() }],
    creator: site.name,
    publisher: site.name,
    metadataBase: new URL(getSiteUrl()),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: site.locale,
      url,
      siteName: site.name,
      title: pageTitle,
      description,
      images: [defaultOgImage],
    },
    twitter: {
      card: site.twitter.card,
      title: pageTitle,
      description,
      images: [defaultOgImage.url],
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true },
        },
    applicationName: site.name,
    appleWebApp: {
      capable: true,
      title: site.shortName,
      statusBarStyle: "default",
    },
    category: "technology",
    formatDetection: {
      telephone: false,
    },
  };
}

/** Metadata for authenticated app screens that should not appear in search results. */
export function createPrivatePageMetadata(
  options: Omit<PageMetadataOptions, "noIndex"> = {},
): Metadata {
  return createPageMetadata({ ...options, noIndex: true });
}
