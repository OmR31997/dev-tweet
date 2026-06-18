"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import { useCallback, useEffect, useRef, useState } from "react";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
}

type PdfPageCarouselProps = {
  data: Uint8Array;
  compact?: boolean;
  className?: string;
  showNav?: boolean;
};

export function PdfPageCarousel({
  data,
  compact,
  className,
  showNav = true,
}: PdfPageCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageUrls, setPageUrls] = useState<string[]>([]);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];

    setRendering(true);
    setPageUrls([]);
    setNumPages(0);
    setCurrentPage(0);

    (async () => {
      try {
        const pdf = await pdfjs.getDocument({ data: data.slice() }).promise;
        if (cancelled) return;

        const total = pdf.numPages;
        setNumPages(total);

        const containerWidth = containerRef.current?.clientWidth || 360;
        const maxHeight = compact ? 224 : 520;

        for (let pageNum = 1; pageNum <= total; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale = Math.min(
            containerWidth / baseViewport.width,
            maxHeight / baseViewport.height,
          );
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;
          urls.push(canvas.toDataURL("image/jpeg", 0.92));
        }

        if (!cancelled) setPageUrls(urls);
      } catch {
        if (!cancelled) setPageUrls([]);
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data, compact]);

  const scrollToPage = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth;
    container.scrollTo({ left: width * index, behavior: "smooth" });
    setCurrentPage(index);
  }, []);

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || pageUrls.length === 0) return;
    const width = container.clientWidth;
    if (width <= 0) return;
    const index = Math.round(container.scrollLeft / width);
    setCurrentPage(Math.max(0, Math.min(index, pageUrls.length - 1)));
  }, [pageUrls.length]);

  if (rendering) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/40 text-sm text-muted-foreground",
          compact ? "h-56" : "h-[min(70vh,520px)]",
          className,
        )}
      >
        Rendering pages…
      </div>
    );
  }

  if (pageUrls.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/40 px-4 text-center text-sm text-muted-foreground",
          compact ? "h-56" : "h-[min(70vh,520px)]",
          className,
        )}
      >
        Could not render this PDF.
      </div>
    );
  }

  const multiPage = numPages > 1;

  return (
    <div className={cn("relative bg-muted/20", className)}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "feed-horizontal-scroll flex overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          multiPage && "snap-x snap-mandatory",
          compact ? "h-56" : "h-[min(70vh,520px)]",
        )}
      >
        {pageUrls.map((url, index) => (
          <div
            key={index}
            className={cn(
              "flex h-full w-full shrink-0 items-center justify-center bg-muted/30",
              multiPage && "snap-center",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Page ${index + 1} of ${numPages}`}
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {multiPage && showNav ? (
        <>
          {currentPage > 0 ? (
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => scrollToPage(currentPage - 1)}
              className="absolute left-2 top-1/2 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow-md transition-colors hover:bg-background md:grid"
            >
              <ChevronLeft className="size-5" />
            </button>
          ) : null}
          {currentPage < pageUrls.length - 1 ? (
            <button
              type="button"
              aria-label="Next page"
              onClick={() => scrollToPage(currentPage + 1)}
              className="absolute right-2 top-1/2 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow-md transition-colors hover:bg-background md:grid"
            >
              <ChevronRight className="size-5" />
            </button>
          ) : null}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
            {pageUrls.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to page ${index + 1}`}
                onClick={() => scrollToPage(index)}
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  index === currentPage ? "bg-primary" : "bg-muted-foreground/40",
                )}
              />
            ))}
            <span className="ml-1 tabular-nums text-muted-foreground">
              {currentPage + 1}/{numPages}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
