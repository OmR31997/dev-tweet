import { isSocketConnected } from "@/lib/socket-state";

/** Poll only when the realtime socket is disconnected (fallback sync). */
export function realtimeRefetchInterval(fallbackMs: number) {
  return isSocketConnected() ? false : fallbackMs;
}
