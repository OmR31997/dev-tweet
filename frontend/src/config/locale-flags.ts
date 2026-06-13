import type { Locale } from "@/i18n/config";

export const localeFlags: Record<Locale, string> = {
  en: "/assets/icons/locale/flag-en.svg",
  hi: "/assets/icons/locale/flag-hi.svg",
};

/** Fixed labels in the popover (always native script). */
export const localeLabels: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
};
