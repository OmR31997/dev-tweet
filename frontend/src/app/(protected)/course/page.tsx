import { CourseView } from "@/components/features/course";
import { NOTION_COURSE_PAGE_ID } from "@/config/course";
import { createPrivatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Course");
  return createPrivatePageMetadata({
    title: t("title"),
    path: "/course",
  });
}

export default function CoursePage() {
  return (
    <div className="h-dvh max-h-dvh overflow-hidden">
      <CourseView initialPageId={NOTION_COURSE_PAGE_ID} />
    </div>
  );
}
