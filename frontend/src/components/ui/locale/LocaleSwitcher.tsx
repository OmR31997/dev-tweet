"use client";

import { localeFlags, localeLabels } from "@/config/locale-flags";
import { Locale, locales } from "@/i18n/config";
import { setUserLocale } from "@/i18n/getLocale";
import { LanguagesIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";

function LocaleFlag({ locale }: { locale: Locale }) {
  return (
    <span className="locale-flag-wrap">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={localeFlags[locale]}
        alt=""
        width={22}
        height={16}
        className="locale-flag"
        decoding="async"
      />
    </span>
  );
}

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("Locale");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const onPointerDown = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, close]);

  function onSelect(nextLocale: Locale) {
    if (nextLocale === locale || isPending) {
      close();
      return;
    }

    startTransition(async () => {
      await setUserLocale(nextLocale);
      router.refresh();
      close();
    });
  }

  return (
    <div className="locale-switcher" ref={rootRef}>
      <button
        type="button"
        className="locale-switcher-trigger"
        onClick={() => setOpen((value) => !value)}
        disabled={isPending}
        aria-label={t("label")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
      >
        <LanguagesIcon className="locale-switcher-icon" aria-hidden />
        <LocaleFlag locale={locale} />
      </button>

      {open ? (
        <div className="locale-popover-panel">
          <ul
            id={listboxId}
            className="locale-popover"
            role="listbox"
            aria-label={t("label")}
          >
            {locales.map((value) => {
              const selected = value === locale;
              return (
                <li key={value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`locale-popover-option${selected ? " locale-popover-option--selected" : ""}`}
                    disabled={isPending}
                    onClick={() => onSelect(value)}
                  >
                    <LocaleFlag locale={value} />
                    <span className="locale-popover-label">
                      {localeLabels[value]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
