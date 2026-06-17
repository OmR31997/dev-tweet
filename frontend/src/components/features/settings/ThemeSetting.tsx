"use client";

import { cn } from "@/lib/utils";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const THEMES = [
  { value: "light", icon: Sun, labelKey: "themeLight" as const },
  { value: "dark", icon: Moon, labelKey: "themeDark" as const },
  { value: "system", icon: Monitor, labelKey: "themeSystem" as const },
] as const;

export function ThemeSetting() {
  const t = useTranslations("Settings");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="px-5 py-4">
      <p className="font-medium">{t("appearance")}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{t("appearanceDesc")}</p>
      <div
        className="mt-3 grid grid-cols-3 gap-2"
        role="radiogroup"
        aria-label={t("appearance")}
      >
        {THEMES.map(({ value, icon: Icon, labelKey }) => {
          const active = mounted && theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={!mounted}
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-colors disabled:opacity-70",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-accent",
              )}
            >
              <Icon className="size-5" />
              {t(labelKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
