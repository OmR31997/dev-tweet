import { AppShell } from "./AppShell";
import type { ReactNode } from "react";

export function DesktopAppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
