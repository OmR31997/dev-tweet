"use client";

import { useTouchPrimaryDevice } from "@/lib/use-touch-primary-device";
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
  embedded?: boolean;
  className?: string;
  showNav?: boolean;
  /** In-feed preview: vertical scroll friendly on touch devices. */
  embedInFeed?: boolean;
  /** Fullscreen: horizontal swipe between pages. */
  swipePages?: boolean;
  onPageInfo?: (current: number, total: number) => void;
};

function getMaxDisplayHeight(compact?: boolean) {
  if (compact) return 256;
  return 520;
}

function getDevicePixelRatio(embedInFeed: boolean) {
  if (typeof window === "undefined") return 1;
  const cap = embedInFeed ? 2 : 2.5;
  return Math.min(window.devicePixelRatio || 1, cap);
}

function useDesktopCarouselInput(
  containerRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const onWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX <= absY && absX < 2) return;

      const maxLeft = el.scrollWidth - el.clientWidth;
      if (maxLeft <= 0) return;

      const goingLeft = e.deltaX < 0;
      const goingRight = e.deltaX > 0;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= maxLeft - 1;

      if ((goingLeft && atStart) || (goingRight && atEnd)) return;

      e.preventDefault();
      el.scrollLeft += e.deltaX;
    };

    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      startX = e.pageX;
      startScroll = el.scrollLeft;
      el.classList.add("is-dragging");
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      e.preventDefault();
      el.scrollLeft = startScroll - (e.pageX - startX);
    };

    const endDrag = () => {
      dragging = false;
      el.classList.remove("is-dragging");
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", endDrag);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endDrag);
      el.classList.remove("is-dragging");
    };
  }, [containerRef, enabled]);
}

function PageDots({
  count,
  currentPage,
  onSelect,
}: {
  count: number;
  currentPage: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="pointer-events-auto absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to page ${index + 1}`}
          onClick={() => onSelect(index)}
          className={cn(
            "size-1.5 rounded-full transition-colors",
            index === currentPage ? "bg-primary" : "bg-muted-foreground/40",
          )}
        />
      ))}
      <span className="ml-1 tabular-nums text-muted-foreground">
        {currentPage + 1}/{count}
      </span>
    </div>
  );
}

function EmbedPdfPageNav({
  count,
  currentPage,
  onPrev,
  onNext,
}: {
  count: number;
  currentPage: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-t border-border/70 bg-muted/25 px-3 py-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={currentPage <= 0}
        onClick={onPrev}
        className="feed-action-btn flex min-h-10 min-w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
      >
        <ChevronLeft className="size-5" />
      </button>
      <span className="text-xs font-medium tabular-nums text-muted-foreground">
        Page {currentPage + 1} of {count}
      </span>
      <button
        type="button"
        aria-label="Next page"
        disabled={currentPage >= count - 1}
        onClick={onNext}
        className="feed-action-btn flex min-h-10 min-w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}

export function PdfPageCarousel({
  data,
  compact,
  embedded,
  className,
  showNav = true,
  embedInFeed = false,
  swipePages = false,
  onPageInfo,
}: PdfPageCarouselProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchPrimary = useTouchPrimaryDevice();
  const [containerWidth, setContainerWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageUrls, setPageUrls] = useState<string[]>([]);
  const [rendering, setRendering] = useState(true);
  const onPageInfoRef = useRef(onPageInfo);
  onPageInfoRef.current = onPageInfo;

  const notifyPageInfo = useCallback((pageIndex: number, total: number) => {
    onPageInfoRef.current?.(pageIndex + 1, total);
  }, []);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const updateWidth = () => {
      const width = el.clientWidth;
      if (width > 0) setContainerWidth(width);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];

    if (containerWidth <= 0) return;

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

        const maxHeight = getMaxDisplayHeight(compact);
        const pixelRatio = getDevicePixelRatio(embedInFeed);

        for (let pageNum = 1; pageNum <= total; pageNum++) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNum);
          const baseViewport = page.getViewport({ scale: 1 });
          const scale =
            Math.min(
              containerWidth / baseViewport.width,
              maxHeight / baseViewport.height,
            ) * pixelRatio;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;

          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);

          await page.render({ canvasContext: context, viewport }).promise;
          urls.push(canvas.toDataURL("image/png"));
        }

        if (!cancelled) {
          setPageUrls(urls);
          notifyPageInfo(0, total);
        }
      } catch {
        if (!cancelled) setPageUrls([]);
      } finally {
        if (!cancelled) setRendering(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [data, compact, containerWidth, embedInFeed, notifyPageInfo]);

  const multiPage = numPages > 1;
  const useStaticEmbed = embedInFeed && touchPrimary;
  const horizontalScroll =
    multiPage && !useStaticEmbed && (swipePages || embedInFeed);

  useDesktopCarouselInput(containerRef, horizontalScroll && !touchPrimary);

  const scrollToPage = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, pageUrls.length - 1));
      if (!horizontalScroll) {
        setCurrentPage(next);
        notifyPageInfo(next, numPages);
        return;
      }
      const container = containerRef.current;
      if (!container) return;
      const width = container.clientWidth;
      container.scrollTo({ left: width * next, behavior: "smooth" });
      setCurrentPage(next);
      notifyPageInfo(next, numPages);
    },
    [horizontalScroll, numPages, notifyPageInfo, pageUrls.length],
  );

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || pageUrls.length === 0) return;
    const width = container.clientWidth;
    if (width <= 0) return;
    const index = Math.round(container.scrollLeft / width);
    const next = Math.max(0, Math.min(index, pageUrls.length - 1));
    setCurrentPage(next);
    notifyPageInfo(next, numPages);
  }, [notifyPageInfo, numPages, pageUrls.length]);

  const heightClass = compact ? "h-64" : "h-[min(70vh,520px)]";

  if (rendering || containerWidth <= 0) {
    return (
      <div
        ref={measureRef}
        className={cn(
          "flex items-center justify-center bg-muted/40 text-sm text-muted-foreground",
          heightClass,
          className,
        )}
      >
        {containerWidth <= 0 ? null : "Rendering pages…"}
      </div>
    );
  }

  if (pageUrls.length === 0) {
    return (
      <div
        ref={measureRef}
        className={cn(
          "flex items-center justify-center bg-muted/40 px-4 text-center text-sm text-muted-foreground",
          heightClass,
          className,
        )}
      >
        Could not render this PDF.
      </div>
    );
  }

  const activeUrl = pageUrls[currentPage] ?? pageUrls[0];
  const chevronClass = cn(
    "absolute top-1/2 z-10 size-8 -translate-y-1/2 place-items-center rounded-full bg-background/90 text-foreground shadow-md transition-colors hover:bg-background",
    swipePages ? "hidden md:grid" : "grid",
  );

  if (!horizontalScroll) {
    return (
      <div
        ref={measureRef}
        className={cn("feed-pdf-embed bg-muted/20", className)}
      >
        <div
          className={cn(
            "feed-pdf-preview relative flex items-center justify-center bg-muted/30",
            heightClass,
          )}
        >
          {activeUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={activeUrl}
              alt={`Page ${currentPage + 1} of ${numPages}`}
              className="pointer-events-none max-h-full max-w-full select-none object-contain"
              draggable={false}
            />
          ) : null}
        </div>

        {multiPage && showNav && useStaticEmbed && !embedInFeed ? (
          <EmbedPdfPageNav
            count={numPages}
            currentPage={currentPage}
            onPrev={() => scrollToPage(currentPage - 1)}
            onNext={() => scrollToPage(currentPage + 1)}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div ref={measureRef} className={cn("relative bg-muted/20", className)}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "flex overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          swipePages ? "feed-horizontal-scroll" : "feed-pdf-desktop-scroll",
          multiPage && "snap-x snap-mandatory",
          !touchPrimary && "cursor-grab select-none [&.is-dragging]:cursor-grabbing",
          heightClass,
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
              className="pointer-events-none max-h-full max-w-full select-none object-contain"
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
              className={cn(chevronClass, "left-2")}
            >
              <ChevronLeft className="size-5" />
            </button>
          ) : null}
          {currentPage < pageUrls.length - 1 ? (
            <button
              type="button"
              aria-label="Next page"
              onClick={() => scrollToPage(currentPage + 1)}
              className={cn(chevronClass, "right-2")}
            >
              <ChevronRight className="size-5" />
            </button>
          ) : null}
          {!embedInFeed ? (
            <PageDots
              count={numPages}
              currentPage={currentPage}
              onSelect={scrollToPage}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
