import { SettingsView } from "@/components/features/settings";
import { createPrivatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = createPrivatePageMetadata({
  title: "Settings",
  path: "/settings",
});

export default function SettingsPage() {
  return <SettingsView />;
}
