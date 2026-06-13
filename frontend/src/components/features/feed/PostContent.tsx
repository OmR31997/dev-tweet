import Link from "next/link";
import { Fragment } from "react";

/** Render post text with `#hashtags` highlighted and links auto-detected. */
export function PostContent({ content }: { content: string }) {
  const parts = content.split(/(\s+)/);
  return (
    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
      {parts.map((part, i) => {
        if (/^#[a-z0-9_]+$/i.test(part)) {
          const tag = part.slice(1).toLowerCase();
          return (
            <Link
              key={i}
              href={`/explore?q=${encodeURIComponent("#" + tag)}`}
              className="text-primary hover:underline"
            >
              {part}
            </Link>
          );
        }
        if (/^https?:\/\/\S+$/i.test(part)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {part}
            </a>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </p>
  );
}
