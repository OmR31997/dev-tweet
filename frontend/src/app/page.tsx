import { HomePageView } from "@/components/features/home";
import { createPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HomePage");

  return createPageMetadata({
    title: t("metaTitle"),
    description: t("metaDescription"),
    path: "/",
  });
}

export default function Home() {
  return <HomePageView />;
}
