"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const maxWidthMap: Record<string, string> = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full",
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, maxWidth = "lg", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full px-4 sm:px-6 lg:px-8",
          maxWidthMap[maxWidth],
          className
        )}
        {...props}
      />
    );
  }
);

Container.displayName = "Container";
