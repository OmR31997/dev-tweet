"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { PageLayout } from "@/components/common/PageLayout";
import { Button } from "@/components/ui/button";
import { useLogout, useUpdateProfile } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthUser } from "@/store";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeSetting } from "./ThemeSetting";

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-primary" : "bg-input"
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export function SettingsView() {
  const t = useTranslations("Settings");
  const user = useAuthUser();
  const update = useUpdateProfile();
  const logout = useLogout();

  if (!user) return null;

  return (
    <PageLayout header={<PageHeader title={t("title")} />}>
      <section className="border-b border-border bg-card">
        <h2 className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("appearanceSection")}
        </h2>
        <ThemeSetting />
      </section>

      <section className="border-b border-border bg-card">
        <h2 className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("notificationsSection")}
        </h2>
        <SettingRow
          title={t("emailNotifications")}
          description={t("emailNotificationsDesc")}
          checked={user.emailNotificationsEnabled ?? true}
          disabled={update.isPending}
          onChange={(next) =>
            update.mutate({ emailNotificationsEnabled: next })
          }
        />
        <SettingRow
          title={t("dailyDigest")}
          description={t("dailyDigestDesc")}
          checked={user.dailyDigestEnabled ?? true}
          disabled={update.isPending}
          onChange={(next) => update.mutate({ dailyDigestEnabled: next })}
        />
      </section>

      <section className="bg-card">
        <h2 className="px-5 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t("accountSection")}
        </h2>
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground">{t("displayName")}</p>
          <p className="font-medium">{user.displayName}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground">{t("email")}</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div className="px-5 py-4">
          <Button
            variant="outline"
            className="w-full text-destructive sm:w-auto"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="size-4" />
            {logout.isPending ? t("signingOut") : t("signOut")}
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
