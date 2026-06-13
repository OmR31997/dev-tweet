import {
  DesktopAppLayout,
  ProtectedAuthGuard,
} from "@/components/layout/desktop";
import { SocketProvider } from "@/provider/SocketProvider";
import type { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedAuthGuard>
      <SocketProvider>
        <DesktopAppLayout>{children}</DesktopAppLayout>
      </SocketProvider>
    </ProtectedAuthGuard>
  );
}
