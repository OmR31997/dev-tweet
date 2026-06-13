import { FeedView } from "@/components/features/feed";
import { createPrivatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = createPrivatePageMetadata({
  title: "Feed",
  path: "/feed",
});

export default function FeedPage() {
  return <FeedView />;
}
