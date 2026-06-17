"use client";

import { cn } from "@/lib/utils";
import { Forward } from "lucide-react";

/** WhatsApp-style forwarded header. */
export function ForwardedLabel({ mine }: { mine: boolean }) {
  return (
    <p
      className={cn(
        "chat-forwarded-label",
        mine ? "chat-forwarded-label--out" : "chat-forwarded-label--in",
      )}
    >
      <Forward className="size-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
      <span>Forwarded</span>
    </p>
  );
}
