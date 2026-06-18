"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MessagesSidebar } from "./MessagesSidebar";

/**
 * Two-pane messages layout. On desktop both panes show; on mobile we show the
 * people list at `/messages` and the conversation at `/messages/[id]`.
 */
export function MessagesShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const inConversation = pathname !== "/messages";

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <div
        className={cn(
          "h-full min-h-0 w-full overflow-hidden md:block md:w-72 md:shrink-0",
          inConversation && "hidden",
        )}
      >
        <MessagesSidebar />
      </div>
      <div
        className={cn(
          "h-full min-h-0 min-w-0 flex-1 overflow-hidden",
          !inConversation && "hidden md:block",
        )}
      >
        {children}
      </div>
    </div>
  );
}
