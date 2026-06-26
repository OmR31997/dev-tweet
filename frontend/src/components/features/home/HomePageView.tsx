"use client";

import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/ui";
import { useAuthHasHydrated, useIsAuthenticated } from "@/store";
import { cn } from "@/lib/utils";
import { Bell, MessageCircle, PenSquare, Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const FEATURE_KEYS = [
  { icon: PenSquare, titleKey: "feature1Title", bodyKey: "feature1Description" },
  { icon: Users, titleKey: "feature2Title", bodyKey: "feature2Description" },
  {
    icon: MessageCircle,
    titleKey: "feature3Title",
    bodyKey: "feature3Description",
  },
  { icon: Bell, titleKey: "feature4Title", bodyKey: "feature4Description" },
] as const;

export function HomePageView() {
  const t = useTranslations("HomePage");
  const router = useRouter();
  const hasHydrated = useAuthHasHydrated();
  const isAuthenticated = useIsAuthenticated();
  const year = useMemo(() => new Date().getFullYear(), []);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace("/feed");
    }
  }, [hasHydrated, isAuthenticated, router]);

  return (
    <div className="min-h-dvh bg-background">
      <header
        className={cn(
          "sticky top-0 z-30 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/95 md:border-b-0",
          isScrolled && "border-b border-border",
        )}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              D
            </span>
            {t("brand")}
          </span>
          <LocaleSwitcher />
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-16 text-center sm:pt-24">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            {t.rich("heroTitle", {
              highlight: (chunks) => (
                <span className="text-primary">{chunks}</span>
              ),
            })}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            {t("heroDescription")}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">{t("ctaPrimary")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">{t("ctaSecondary")}</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_KEYS.map(({ icon: Icon, titleKey, bodyKey }) => (
            <div
              key={titleKey}
              className="rounded-2xl border border-border bg-card p-6 text-left"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">{t(titleKey)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(bodyKey)}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        {t("footerCopyright", { year })}
      </footer>
    </div>
  );
}
