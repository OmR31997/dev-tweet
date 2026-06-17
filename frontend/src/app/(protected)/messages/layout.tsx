import { MessagesShell } from "@/components/features/messages";
import { createPrivatePageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createPrivatePageMetadata({
  title: "Messages",
});

export default function MessagesLayout({ children }: { children: ReactNode }) {
  return <MessagesShell>{children}</MessagesShell>;
}
