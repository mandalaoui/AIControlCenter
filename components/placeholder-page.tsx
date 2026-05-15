"use client";

import { useTranslation } from "react-i18next";

import { DashboardCard } from "@/components/dashboard-card";

interface PlaceholderPageProps {
  titleKey: string;
}

export function PlaceholderPage({ titleKey }: PlaceholderPageProps) {
  const { t } = useTranslation("common");

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">{t(titleKey)}</h2>
      <DashboardCard title={t(titleKey)} badge={t("placeholderBadge")}>
        <p className="text-sm text-muted-foreground">{t("comingSoon")}</p>
      </DashboardCard>
    </section>
  );
}
