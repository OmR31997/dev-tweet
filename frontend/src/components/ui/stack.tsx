"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column";
  spacing?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10; // map to Tailwind gap classes
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

const spacingMap: Record<number, string> = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
};

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = "column",
      spacing = 2,
      align = "start",
      justify = "start",
      className,
      ...props
    },
    ref
  ) => {
    const directionClass = direction === "row" ? "flex-row" : "flex-col";
    const spacingClass = spacingMap[spacing] || "gap-2";
    const alignClass = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    }[align];
    const justifyClass = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    }[justify];

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          directionClass,
          spacingClass,
          alignClass,
          justifyClass,
          className
        )}
        {...props}
      />
    );
  }
);

Stack.displayName = "Stack";
