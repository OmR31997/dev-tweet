import type { PostAttachment } from "@/lib/api";

export const POST_MAX_LENGTH = 1000;
export const POST_MAX_IMAGES = 4;
export const POST_MAX_ATTACHMENTS = 4;
export const POST_MAX_MEDIA =
  POST_MAX_IMAGES + POST_MAX_ATTACHMENTS;

export const POST_FILE_ACCEPT =
  "image/*,video/mp4,video/webm,video/quicktime,.pdf,application/pdf,text/csv,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function isVideoMime(mime: string) {
  return mime.startsWith("video/");
}

export function isSpreadsheetMime(mime: string, filename: string) {
  const lower = filename.toLowerCase();
  return (
    mime === "text/csv" ||
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    lower.endsWith(".csv") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsx")
  );
}

export function isPdfMime(mime: string, filename: string) {
  return mime === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
}

export function attachmentKind(
  attachment: Pick<PostAttachment, "mimeType" | "filename">,
) {
  if (attachment.mimeType.startsWith("video/")) return "video" as const;
  if (isSpreadsheetMime(attachment.mimeType, attachment.filename)) {
    return "spreadsheet" as const;
  }
  if (isPdfMime(attachment.mimeType, attachment.filename)) return "pdf" as const;
  return "document" as const;
}

export function fileKind(file: File) {
  if (file.type.startsWith("image/")) return "image" as const;
  if (file.type.startsWith("video/")) return "video" as const;
  if (isSpreadsheetMime(file.type, file.name)) return "spreadsheet" as const;
  if (isPdfMime(file.type, file.name)) return "pdf" as const;
  return "document" as const;
}
