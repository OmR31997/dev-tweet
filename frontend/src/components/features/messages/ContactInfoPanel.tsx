"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { UserAvatar } from "@/components/common/UserAvatar";
import { useUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bookmark,
  ChevronRight,
  ImageIcon,
  ThumbsDown,
  Trash2,
  Wallpaper,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type ContactInfoPanelProps = {
  open: boolean;
  userId: string;
  onClose: () => void;
  onOpenMedia: () => void;
};

export function ContactInfoPanel({
  open,
  userId,
  onClose,
  onOpenMedia,
}: ContactInfoPanelProps) {
  const t = useTranslations("Chat");
  const user = useUser(userId);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"block" | "report" | "delete" | null>(
    null,
  );

  useEffect(() => {
    if (!open) {
      setNotice(null);
      setConfirm(null);
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

  const displayName = user.data?.displayName ?? "…";
  const subtitle =
    user.data?.email ||
    [user.data?.college, user.data?.branch].filter(Boolean).join(" · ");

  const showComingSoon = () => {
    setNotice(t("comingSoon"));
    window.setTimeout(() => setNotice(null), 2500);
  };

  const onConfirmAction = () => {
    const action = confirm;
    setConfirm(null);
    if (action === "block") setNotice(t("blockedNotice"));
    else if (action === "report") setNotice(t("reportedNotice"));
    else showComingSoon();
    window.setTimeout(() => setNotice(null), 2500);
  };

  return (
    <>
      <aside
        className={cn(
          "chat-contact-panel",
          "fixed inset-0 z-50 h-full w-full max-w-full shadow-2xl",
          "md:static md:inset-auto md:z-auto md:h-full md:w-full md:max-w-[400px] md:shadow-none",
        )}
      >
        <header className="chat-contact-header">
          <button
            type="button"
            className="chat-contact-close"
            onClick={onClose}
            aria-label={t("closeContactInfo")}
          >
            ×
          </button>
          <h2 className="chat-contact-title">{t("contactInfoTitle")}</h2>
        </header>

        {notice ? <p className="chat-contact-notice">{notice}</p> : null}

        <div className="chat-contact-scroll">
          <div className="chat-contact-profile">
            <UserAvatar
              name={user.data?.displayName}
              photoURL={user.data?.photoURL}
              className="size-[120px] text-4xl"
            />
            <h3 className="chat-contact-name">{displayName}</h3>
            {subtitle ? (
              <p className="chat-contact-phone">{subtitle}</p>
            ) : null}
          </div>

          <section className="chat-contact-bio">
            <div className="chat-contact-bio-head">
              <span className="chat-contact-bio-label">{t("bio")}</span>
            </div>
            {user.data?.bio ? (
              <p className="chat-contact-bio-text">{user.data.bio}</p>
            ) : (
              <p className="chat-contact-bio-empty">{t("noBio")}</p>
            )}
          </section>

          <nav className="chat-contact-nav" aria-label={t("contactOptions")}>
            <button
              type="button"
              className="chat-contact-menu-item"
              onClick={onOpenMedia}
            >
              <ImageIcon className="size-5 shrink-0 text-muted-foreground" />
              <span className="chat-contact-menu-label">{t("mediaAndFiles")}</span>
              <ChevronRight className="chat-contact-menu-chevron" aria-hidden />
            </button>
            <button
              type="button"
              className="chat-contact-menu-item"
              onClick={showComingSoon}
            >
              <Bookmark className="size-5 shrink-0 text-muted-foreground" />
              <span className="chat-contact-menu-label">{t("savedMessages")}</span>
              <ChevronRight className="chat-contact-menu-chevron" aria-hidden />
            </button>
            <button
              type="button"
              className="chat-contact-menu-item"
              onClick={showComingSoon}
            >
              <Wallpaper className="size-5 shrink-0 text-muted-foreground" />
              <span className="chat-contact-menu-label">{t("chatBackground")}</span>
              <ChevronRight className="chat-contact-menu-chevron" aria-hidden />
            </button>
          </nav>

          <div className="chat-contact-actions">
            <button
              type="button"
              className="chat-contact-menu-item chat-contact-menu-item--danger"
              onClick={() => setConfirm("block")}
            >
              <ThumbsDown className="size-5 shrink-0 text-[#e14434]" />
              <span className="chat-contact-menu-label">{t("block")}</span>
            </button>
            <button
              type="button"
              className="chat-contact-menu-item chat-contact-menu-item--danger"
              onClick={() => setConfirm("report")}
            >
              <AlertTriangle className="size-5 shrink-0 text-[#e14434]" />
              <span className="chat-contact-menu-label">{t("report")}</span>
            </button>
            <button
              type="button"
              className="chat-contact-menu-item chat-contact-menu-item--danger"
              onClick={() => setConfirm("delete")}
            >
              <Trash2 className="size-5 shrink-0 text-[#e14434]" />
              <span className="chat-contact-menu-label">{t("delete")}</span>
            </button>
          </div>
        </div>
      </aside>

      <ConfirmDialog
        open={confirm === "block"}
        title={t("blockConfirmTitle")}
        message={t("blockConfirmMessage", { name: displayName })}
        confirmLabel={t("confirmYes")}
        cancelLabel={t("confirmNo")}
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={onConfirmAction}
      />
      <ConfirmDialog
        open={confirm === "report"}
        title={t("reportConfirmTitle")}
        message={t("reportConfirmMessage", { name: displayName })}
        confirmLabel={t("confirmYes")}
        cancelLabel={t("confirmNo")}
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={onConfirmAction}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        title={t("deleteConfirmTitle")}
        message={t("deleteConfirmMessage", { name: displayName })}
        confirmLabel={t("confirmYes")}
        cancelLabel={t("confirmNo")}
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={onConfirmAction}
      />
    </>
  );
}
