"use client";

import type { PostAttachment } from "@/lib/api";
import { fetchFileBlob } from "@/lib/api/fetch-file-blob";
import { resolveChatFileUrl } from "@/lib/api/normalizers";
import { parseCsv } from "@/lib/parse-csv";
import { cn } from "@/lib/utils";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PostDocumentShell } from "./PostPdfViewer";

const PREVIEW_ROWS = 50;
const PREVIEW_COLS = 8;

export function PostCsvViewer({
  attachment,
  compact,
  embedded,
}: {
  attachment: PostAttachment;
  compact?: boolean;
  embedded?: boolean;
}) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchFileBlob(resolveChatFileUrl(attachment.fileId))
      .then((blob) => blob.text())
      .then((text) => {
        if (cancelled) return;
        const parsed = parseCsv(text, PREVIEW_ROWS + 1);
        if (parsed.length === 0) {
          setError("This file has no readable rows.");
          return;
        }
        setRows(parsed);
      })
      .catch(() => {
        if (!cancelled) setError("Could not preview this spreadsheet.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attachment.fileId]);

  const header = rows?.[0] ?? [];
  const body = rows?.slice(1) ?? [];
  const colCount = Math.min(
    Math.max(header.length, ...body.map((r) => r.length), 1),
    PREVIEW_COLS,
  );

  return (
    <PostDocumentShell
      attachment={attachment}
      kindLabel="Spreadsheet"
      icon={<FileSpreadsheet className={embedded ? "size-4" : "size-5"} />}
      compact={compact}
      embedded={embedded}
    >
      <div
        className={cn(
          "overflow-auto bg-background",
          compact ? "max-h-56" : "max-h-[min(70vh,520px)]",
        )}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading preview…
          </div>
        ) : error ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {error}
          </p>
        ) : (
          <table className="w-full min-w-max border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <tr>
                {Array.from({ length: colCount }, (_, i) => (
                  <th
                    key={i}
                    className="border-b border-border px-3 py-2 font-semibold text-foreground"
                  >
                    {header[i]?.trim() || `Column ${i + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="odd:bg-muted/20 even:bg-background"
                >
                  {Array.from({ length: colCount }, (_, colIndex) => (
                    <td
                      key={colIndex}
                      className="max-w-[200px] truncate border-b border-border/60 px-3 py-2 text-muted-foreground"
                      title={row[colIndex] ?? ""}
                    >
                      {row[colIndex] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {!loading && !error && rows && rows.length > PREVIEW_ROWS ? (
        <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Showing first {PREVIEW_ROWS} rows. Download to view the full file.
        </p>
      ) : null}
    </PostDocumentShell>
  );
}
