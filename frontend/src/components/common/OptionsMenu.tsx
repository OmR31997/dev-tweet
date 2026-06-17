"use client";

import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";

export function OptionsMenu({
  open,
  onToggle,
  onClose,
  items,
  ariaLabel = "Options",
}: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  items: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    destructive?: boolean;
  }>;
  ariaLabel?: string;
}) {
  return (
    <div className="relative ml-auto">
      <button
        type="button"
        onClick={onToggle}
        aria-label={ariaLabel}
        aria-expanded={open}
        className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <MoreHorizontal className="size-5" />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} aria-hidden />
          <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
            {items.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
                  index > 0 && "border-t border-border",
                  item.destructive && "text-destructive",
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
