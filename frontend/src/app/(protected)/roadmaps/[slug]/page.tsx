import { RoadmapDetailView } from "@/components/features/roadmaps";
import { getRoadmapBySlug } from "@/lib/roadmaps/catalog";
import { createPrivatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getRoadmapBySlug(slug);
  const t = await getTranslations("Roadmaps");

  return createPrivatePageMetadata({
    title: item?.title ?? t("title"),
    path: `/roadmaps/${slug}`,
  });
}

export default async function RoadmapSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="h-dvh max-h-dvh overflow-hidden">
      <RoadmapDetailView slug={slug} />
    </div>
  );
}
