import { LearnGitView } from "@/components/features/learn-git";
import { createPrivatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("LearnGit");
  return createPrivatePageMetadata({
    title: t("title"),
    path: "/learn-git",
  });
}

export default function LearnGitPage() {
  return (
    <div className="h-dvh max-h-dvh overflow-hidden">
      <LearnGitView />
    </div>
  );
}
