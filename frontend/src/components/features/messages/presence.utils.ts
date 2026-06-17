"use client";

import type { UserPresence } from "@/lib/api";
import { formatLastSeen } from "@/lib/format";

export function presenceSubtitle(
  presence: UserPresence | undefined,
  options?: { typing?: boolean },
) {
  if (options?.typing) return "typing…";
  if (!presence) return null;
  if (presence.online) return "online";
  if (presence.lastSeenAt) return formatLastSeen(presence.lastSeenAt);
  return "offline";
}
