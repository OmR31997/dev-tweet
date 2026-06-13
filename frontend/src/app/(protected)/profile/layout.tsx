import { createPrivatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createPrivatePageMetadata({
  title: "Profile",
  path: "/profile",
});

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
