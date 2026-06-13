import { AuthRedirectGuard } from "@/components/features/auth";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthRedirectGuard>{children}</AuthRedirectGuard>;
}
