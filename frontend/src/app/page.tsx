import { HomePageView } from "@/components/features/home";
import { site } from "@/config/site";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = createPageMetadata({
  description: site.description,
  path: "/",
});

export default function Home() {
  return <HomePageView />;
}
