"use client";

import { useVisualViewportInset } from "@/lib/use-visual-viewport-inset";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function MobileSheet({
  open,
  onClose,
  title,
  titleId,
  closeLabel = "Close",
  children,
  className,
  panelClassName,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId?: string;
  closeLabel?: string;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  const keyboardInset = useVisualViewportInset(open);
  const headingId = titleId ?? "mobile-sheet-title";

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const panelMaxHeight =
    keyboardInset > 0
      ? `calc(100dvh - ${keyboardInset}px - env(safe-area-inset-top, 0px))`
      : "min(92dvh, 100%)";

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[70] flex flex-col justify-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex min-h-0 w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl",
          panelClassName,
        )}
        style={{
          maxHeight: panelMaxHeight,
          marginBottom: keyboardInset > 0 ? keyboardInset : 0,
        }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2 id={headingId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
            aria-label={closeLabel}
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
