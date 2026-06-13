"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "text-lg font-medium",
      h6: "text-base font-medium",
      subtitle1: "text-base font-normal text-muted-foreground",
      subtitle2: "text-sm font-medium text-muted-foreground",
      body1: "text-base leading-relaxed",
      body2: "text-sm leading-relaxed",
      caption: "text-xs text-muted-foreground",
      overline: "text-xs uppercase tracking-wide text-muted-foreground",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
      success: "text-green-600 dark:text-green-500",
      warning: "text-yellow-600 dark:text-yellow-500",
    },
  },
  defaultVariants: {
    variant: "body1",
    align: "left",
    tone: "default",
  },
});

// mapping variant -> safe HTML tag
const variantMapping: Record<string, keyof React.JSX.IntrinsicElements> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  subtitle1: "p",
  subtitle2: "p",
  body1: "p",
  body2: "p",
  caption: "span",
  overline: "span",
};

interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof typographyVariants> {
  asChild?: boolean;
}

function Typography({
  className,
  variant,
  align,
  tone,
  asChild = false,
  ...props
}: TypographyProps) {
  const Comp: React.ElementType = asChild
    ? Slot
    : variant
    ? variantMapping[variant]
    : "p";

  return (
    <Comp
      data-slot="typography"
      className={cn(typographyVariants({ variant, align, tone }), className)}
      {...props}
    />
  );
}

export { Typography, typographyVariants };
