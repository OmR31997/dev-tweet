"use client";

import type { Message } from "@/lib/api";
import { resolveChatFileUrl } from "@/lib/api/normalizers";
import { cn } from "@/lib/utils";
import { FileText, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import {
  ChatMediaPreview,
  type ChatMediaPreviewItem,
} from "./ChatMediaPreview";
import {
  extractChatFiles,
  extractChatLinks,
  extractChatMedia,
  fileExtension,
  fileMetaLine,
  formatLinkHost,
  groupFilesByMonth,
} from "./chat-panel.utils";

type MediaTab = "media" | "files" | "links" | "audio";

type MediaFilesPanelProps = {
  open: boolean;
  messages: Message[];
  onClose: () => void;
};

export function MediaFilesPanel({
  open,
  messages,
  onClose,
}: MediaFilesPanelProps) {
  const t = useTranslations("Chat");
  const [tab, setTab] = useState<MediaTab>("media");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const mediaItems = useMemo(() => extractChatMedia(messages), [messages]);
  const fileItems = useMemo(() => extractChatFiles(messages), [messages]);
  const linkItems = useMemo(() => extractChatLinks(messages), [messages]);
  const fileGroups = useMemo(() => groupFilesByMonth(fileItems), [fileItems]);

  const previewGallery: ChatMediaPreviewItem[] = useMemo(
    () =>
      mediaItems.map((message) => ({
        src: resolveChatFileUrl(message.attachmentId),
        filename: message.attachmentFilename,
        caption: message.content,
        size: message.attachmentSize,
        kind: "image",
      })),
    [mediaItems],
  );

  useEffect(() => {
    if (!open) {
      setTab("media");
      setPreviewIndex(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  const tabs: { id: MediaTab; label: string }[] = [
    { id: "media", label: t("media") },
    { id: "files", label: t("files") },
    { id: "links", label: t("links") },
    { id: "audio", label: t("audio") },
  ];

  return (
    <>
      <aside
        className={cn(
          "chat-media-modal",
          "fixed inset-0 z-[70] h-full w-full max-w-full shadow-2xl",
          "md:static md:inset-auto md:z-auto md:h-full md:w-full md:max-w-[400px] md:shadow-none",
        )}
      >
        <header className="chat-media-modal-header">
          <button
            type="button"
            className="chat-media-modal-close"
            onClick={onClose}
            aria-label={t("closeMediaModal")}
          >
            ×
          </button>
          <h2 className="chat-media-modal-title">{t("mediaFilesLinksTitle")}</h2>
        </header>

        <div className="chat-media-tabs" role="tablist">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={cn(
                "chat-media-tab",
                tab === item.id && "chat-media-tab--active",
              )}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="chat-media-modal-body">
          {tab === "media" ? (
            mediaItems.length === 0 ? (
              <p className="chat-media-empty">{t("mediaTabEmpty")}</p>
            ) : (
              <ul className="chat-media-grid">
                {mediaItems.map((message, index) => {
                  const src = resolveChatFileUrl(message.attachmentId);
                  return (
                    <li key={message.id}>
                      <button
                        type="button"
                        className="chat-media-grid-item"
                        onClick={() => setPreviewIndex(index)}
                        aria-label={t("openImagePreview")}
                      >
                        <img
                          src={src}
                          alt=""
                          className="size-full object-cover"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )
          ) : null}

          {tab === "files" ? (
            fileItems.length === 0 ? (
              <p className="chat-media-empty">{t("mediaTabEmpty")}</p>
            ) : (
              <div className="chat-file-list">
                {fileGroups.map((group) => (
                  <section key={group.title}>
                    <h3 className="chat-file-group-title">{group.title}</h3>
                    <ul className="chat-file-group-list">
                      {group.items.map((file) => {
                        const ext = fileExtension(
                          file.attachmentFilename,
                          file.attachmentMimeType,
                        );
                        const href = resolveChatFileUrl(file.attachmentId);
                        return (
                          <li key={file.id}>
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="chat-file-row"
                            >
                              <span className="chat-file-icon-wrap">
                                <FileText className="chat-file-doc-icon size-6 text-muted-foreground" />
                                <span className="chat-file-ext-badge">{ext}</span>
                              </span>
                              <span className="chat-file-info">
                                <span className="chat-file-name">
                                  {file.attachmentFilename ?? "Document"}
                                </span>
                                <span className="chat-file-meta">
                                  {fileMetaLine(file)}
                                </span>
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )
          ) : null}

          {tab === "links" ? (
            linkItems.length === 0 ? (
              <p className="chat-media-empty">{t("mediaTabEmpty")}</p>
            ) : (
              <ul className="chat-file-group-list">
                {linkItems.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chat-file-row"
                    >
                      <span className="chat-file-icon-wrap">
                        <Link2 className="chat-file-doc-icon size-6 text-muted-foreground" />
                        <span className="chat-file-ext-badge chat-file-ext-badge--link">
                          LINK
                        </span>
                      </span>
                      <span className="chat-file-info">
                        <span className="chat-file-name">{formatLinkHost(link.url)}</span>
                        <span className="chat-file-meta break-all">{link.url}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )
          ) : null}

          {tab === "audio" ? (
            <p className="chat-media-empty">{t("mediaTabEmpty")}</p>
          ) : null}
        </div>
      </aside>

      <ChatMediaPreview
        item={previewIndex !== null ? previewGallery[previewIndex] ?? null : null}
        onClose={() => setPreviewIndex(null)}
        hasPrev={previewIndex !== null && previewIndex > 0}
        hasNext={
          previewIndex !== null && previewIndex < previewGallery.length - 1
        }
        onPrev={() =>
          setPreviewIndex((index) =>
            index !== null && index > 0 ? index - 1 : index,
          )
        }
        onNext={() =>
          setPreviewIndex((index) =>
            index !== null && index < previewGallery.length - 1
              ? index + 1
              : index,
          )
        }
      />
    </>
  );
}
