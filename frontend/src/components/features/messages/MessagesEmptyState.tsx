"use client";

import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function MessagesEmptyState() {
  const t = useTranslations("Chat");

  return (
    <div className="grid h-full place-items-center text-center">
      <div className="text-muted-foreground">
        <MessageCircle className="mx-auto mb-3 size-10 opacity-50" />
        <p className="text-sm">{t("selectSomeone")}</p>
      </div>
    </div>
  );
}
