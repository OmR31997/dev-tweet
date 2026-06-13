import type { ReactNode } from "react";

/**
 * Previously gated the app to desktop-only. DevTweetHub is responsive, so this
 * now simply renders its children.
 */
export function DesktopGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
