"use client";

import { useTranslation } from "react-i18next";

import { DashboardCard } from "@/components/dashboard-card";
import {
  formatCurrency,
  formatNumber,
  formatRoiDisplay,
  formatScore,
} from "@/lib/format";
import type { RoiEfficiencyMetrics } from "@/lib/types";

interface RoiMetricsGridProps {
  metrics: RoiEfficiencyMetrics;
}

export function RoiMetricsGrid({ metrics }: RoiMetricsGridProps) {
  const { t } = useTranslation("common");

  const items = [
    { label: t("estimatedROI"), value: formatRoiDisplay(metrics.totalROI) },
    {
      label: t("aiEfficiencyScore"),
      value: formatScore(metrics.efficiencyScore),
    },
    {
      label: t("wasteRatio"),
      value: `${formatNumber(metrics.wasteRatio * 100, 1)}%`,
    },
    {
      label: t("costPerTask"),
      value: formatCurrency(metrics.costPerSuccessfulTask),
    },
    {
      label: t("hoursSaved"),
      value: formatNumber(metrics.hoursSaved),
    },
    {
      label: t("costSavingsOpportunity"),
      value: formatCurrency(metrics.costSavingsOpportunity),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <DashboardCard key={item.label} title={item.label}>
          <p className="text-3xl font-bold text-foreground" dir="ltr">
            {item.value}
          </p>
        </DashboardCard>
      ))}
    </div>
  );
}
