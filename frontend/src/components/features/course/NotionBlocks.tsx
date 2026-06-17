import type { NotionBlock, NotionRichText } from "@/lib/notion/types";
import { extractRichText } from "@/lib/notion/fetch-blocks";
import { cn } from "@/lib/utils";

function RichText({ parts }: { parts: NotionRichText[] }) {
  if (parts.length === 0) return null;

  return (
    <>
      {parts.map((part, index) => {
        let content: React.ReactNode = part.plain_text;
        const className = cn(
          part.annotations?.code &&
            "rounded bg-muted px-1 py-0.5 font-mono text-sm",
          part.annotations?.bold && "font-semibold",
          part.annotations?.italic && "italic",
          part.annotations?.underline && "underline",
          part.annotations?.strikethrough && "line-through",
        );

        if (part.href) {
          content = (
            <a
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              {part.plain_text}
            </a>
          );
        }

        return (
          <span
            key={`${index}-${part.plain_text.slice(0, 12)}`}
            className={className}
          >
            {content}
          </span>
        );
      })}
    </>
  );
}

function blockPayload(block: NotionBlock): Record<string, unknown> {
  const payload = block[block.type];
  return typeof payload === "object" && payload !== null
    ? (payload as Record<string, unknown>)
    : {};
}

function renderBlock(
  block: NotionBlock,
  onOpenPage: (pageId: string) => void,
): React.ReactNode {
  const payload = blockPayload(block);
  const rich = extractRichText(payload as { rich_text?: NotionRichText[] });

  switch (block.type) {
    case "paragraph":
      return (
        <p className="my-2 text-sm leading-relaxed">
          <RichText parts={rich} />
        </p>
      );

    case "heading_1":
      return (
        <h2
          id={block.id}
          className="mb-2 mt-8 scroll-mt-20 text-xl font-bold tracking-tight"
        >
          <RichText parts={rich} />
        </h2>
      );

    case "heading_2":
      return (
        <h3
          id={block.id}
          className="mb-2 mt-6 scroll-mt-20 text-lg font-semibold"
        >
          <RichText parts={rich} />
        </h3>
      );

    case "heading_3":
      return (
        <h4
          id={block.id}
          className="mb-1 mt-4 scroll-mt-20 text-base font-semibold"
        >
          <RichText parts={rich} />
        </h4>
      );

    case "quote":
      return (
        <blockquote className="my-3 border-l-4 border-primary/40 pl-4 text-sm italic text-muted-foreground">
          <RichText parts={rich} />
        </blockquote>
      );

    case "divider":
      return <hr className="my-6 border-border" />;

    case "code": {
      const language =
        typeof payload.language === "string" ? payload.language : "text";
      const code = rich.map((p) => p.plain_text).join("");
      return (
        <pre className="my-3 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs">
          <code data-language={language}>{code}</code>
        </pre>
      );
    }

    case "callout": {
      const icon =
        typeof payload.icon === "object" &&
        payload.icon !== null &&
        "emoji" in payload.icon
          ? String((payload.icon as { emoji?: string }).emoji)
          : "💡";
      return (
        <div className="my-3 flex gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
          <span className="text-lg">{icon}</span>
          <div className="min-w-0 flex-1">
            <RichText parts={rich} />
            {block.children ? (
              <NotionBlocks blocks={block.children} onOpenPage={onOpenPage} />
            ) : null}
          </div>
        </div>
      );
    }

    case "toggle": {
      const label = rich.map((p) => p.plain_text).join("") || "Details";
      return (
        <details className="my-2 rounded-lg border border-border px-4 py-2">
          <summary className="cursor-pointer text-sm font-medium">{label}</summary>
          {block.children ? (
            <div className="mt-2 pl-2">
              <NotionBlocks blocks={block.children} onOpenPage={onOpenPage} />
            </div>
          ) : null}
        </details>
      );
    }

    case "bulleted_list_item":
    case "numbered_list_item":
      return (
        <>
          <RichText parts={rich} />
          {block.children ? (
            <div className="mt-1">
              <NotionBlocks blocks={block.children} onOpenPage={onOpenPage} />
            </div>
          ) : null}
        </>
      );

    case "child_page": {
      const title =
        typeof payload.title === "string" ? payload.title : "Lesson";
      return (
        <button
          type="button"
          onClick={() => onOpenPage(block.id)}
          className="my-2 flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/40"
        >
          <span>{title}</span>
          <span className="text-muted-foreground">→</span>
        </button>
      );
    }

    case "child_database":
      return (
        <p className="my-2 text-sm text-muted-foreground">
          Database — open in Notion for the full table view.
        </p>
      );

    case "bookmark": {
      const url = typeof payload.url === "string" ? payload.url : undefined;
      const caption = extractRichText(payload);
      if (!url) return null;
      const label =
        rich.map((p) => p.plain_text).join("") ||
        caption.map((p) => p.plain_text).join("") ||
        url;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-2 block rounded-xl border border-border bg-card px-4 py-3 text-sm text-primary hover:bg-muted/40"
        >
          {label}
        </a>
      );
    }

    case "image": {
      const file = payload.file as { url?: string } | undefined;
      const external = payload.external as { url?: string } | undefined;
      const src = file?.url ?? external?.url;
      const caption = extractRichText(payload);
      if (!src) return null;
      return (
        <figure className="my-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={caption.map((p) => p.plain_text).join("") || ""}
            className="max-h-96 w-full rounded-xl border border-border object-contain"
          />
          {caption.length > 0 ? (
            <figcaption className="mt-1 text-center text-xs text-muted-foreground">
              <RichText parts={caption} />
            </figcaption>
          ) : null}
        </figure>
      );
    }

    case "video": {
      const external = payload.external as { url?: string } | undefined;
      if (!external?.url) return null;
      return (
        <a
          href={external.url}
          target="_blank"
          rel="noopener noreferrer"
          className="my-2 block text-sm text-primary underline"
        >
          Watch video
        </a>
      );
    }

    case "to_do": {
      const checked = Boolean(payload.checked);
      return (
        <label className="my-1 flex items-start gap-2 text-sm">
          <input type="checkbox" checked={checked} readOnly className="mt-1" />
          <span
            className={checked ? "text-muted-foreground line-through" : ""}
          >
            <RichText parts={rich} />
          </span>
        </label>
      );
    }

    default:
      if (block.children && block.children.length > 0) {
        return (
          <NotionBlocks blocks={block.children} onOpenPage={onOpenPage} />
        );
      }
      return null;
  }
}

export function NotionBlocks({
  blocks,
  onOpenPage,
}: {
  blocks: NotionBlock[];
  onOpenPage: (pageId: string) => void;
}) {
  const elements: React.ReactNode[] = [];
  let bulletGroup: NotionBlock[] = [];
  let numberedGroup: NotionBlock[] = [];

  const flushBullets = () => {
    if (bulletGroup.length === 0) return;
    elements.push(
      <ul key={`ul-${bulletGroup[0]?.id}`} className="my-2 list-disc space-y-1 pl-5">
        {bulletGroup.map((block) => (
          <li key={block.id}>{renderBlock(block, onOpenPage)}</li>
        ))}
      </ul>,
    );
    bulletGroup = [];
  };

  const flushNumbered = () => {
    if (numberedGroup.length === 0) return;
    elements.push(
      <ol
        key={`ol-${numberedGroup[0]?.id}`}
        className="my-2 list-decimal space-y-1 pl-5"
      >
        {numberedGroup.map((block) => (
          <li key={block.id}>{renderBlock(block, onOpenPage)}</li>
        ))}
      </ol>,
    );
    numberedGroup = [];
  };

  for (const block of blocks) {
    if (block.type === "bulleted_list_item") {
      flushNumbered();
      bulletGroup.push(block);
      continue;
    }
    if (block.type === "numbered_list_item") {
      flushBullets();
      numberedGroup.push(block);
      continue;
    }

    flushBullets();
    flushNumbered();
    elements.push(
      <div key={block.id}>{renderBlock(block, onOpenPage)}</div>,
    );
  }

  flushBullets();
  flushNumbered();

  return <>{elements}</>;
}
