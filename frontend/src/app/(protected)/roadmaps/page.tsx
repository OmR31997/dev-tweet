import { RoadmapsView } from "@/components/features/roadmaps";
import { createPrivatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Roadmaps");
  return createPrivatePageMetadata({
    title: t("title"),
    path: "/roadmaps",
  });
}

export default function RoadmapsPage() {
  return <RoadmapsView />;
}
