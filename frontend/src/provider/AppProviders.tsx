"use client";

import { StoreHydration } from "@/store";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { TokenRefreshProvider } from "./TokenRefreshProvider";
import type { ReactNode } from "react";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <StoreHydration>
      <QueryProvider>
        <TokenRefreshProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </TokenRefreshProvider>
      </QueryProvider>
    </StoreHydration>
  );
}
