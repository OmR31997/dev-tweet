import { NotificationsView } from "@/components/features/notifications";
import { createPrivatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = createPrivatePageMetadata({
  title: "Notifications",
  path: "/notifications",
});

export default function NotificationsPage() {
  return <NotificationsView />;
}
