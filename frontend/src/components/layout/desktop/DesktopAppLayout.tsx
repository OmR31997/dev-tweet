import { ChatNavRail } from "./ChatNavRail";
import { MobileNav } from "./MobileNav";
import type { ReactNode } from "react";

export function DesktopAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-muted/30">
      <ChatNavRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
