import { DesktopGate } from "@/components/layout/desktop";
import { site } from "@/config/site";
import { WebsiteJsonLd } from "@/lib/seo/json-ld";
import { createPageMetadata } from "@/lib/seo/metadata";
import { AppProviders } from "@/provider";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  ...createPageMetadata(),
  manifest: "/site.webmanifest",
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: site.themeColor },
    { media: "(prefers-color-scheme: dark)", color: site.themeColor },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.variable}>
        <WebsiteJsonLd />
        <NextIntlClientProvider>
          <AppProviders>
            <DesktopGate>{children}</DesktopGate>
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
