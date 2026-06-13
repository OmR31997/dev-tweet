"use client";

import { useAuthStore } from "@/store/slices/auth.slice";
import { useEffect, type ReactNode } from "react";

interface StoreHydrationProps {
  children: ReactNode;
}

/**
 * Rehydrates persisted Zustand stores on the client before auth-dependent UI renders.
 */
export function StoreHydration({ children }: StoreHydrationProps) {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  return <>{children}</>;
}
