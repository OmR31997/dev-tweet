import { ExploreView } from "@/components/features/explore";
import { createPrivatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = createPrivatePageMetadata({
  title: "Explore",
  path: "/explore",
});

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExploreView />
    </Suspense>
  );
}
