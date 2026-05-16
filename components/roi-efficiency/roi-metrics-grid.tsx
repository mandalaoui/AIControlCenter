"use client";

import { useTranslation } from "react-i18next";

import { DashboardCard } from "@/components/dashboard-card";
import {
  formatCurrency,
  formatCurrencyPrecise,
  formatNumber,
  formatRoiDisplay,
  formatScore,
} from "@/lib/format";
import type { RoiEfficiencyMetrics } from "@/lib/types";
import { InfoTooltip } from "./info-tooltip";

interface RoiMetricsGridProps {
  metrics: RoiEfficiencyMetrics;
}

// Metrics to display, matching order and translation keys from @common.json (57-98)
const METRIC_CONFIG = [
  {
    key: "estimatedROI",
    getValue: (metrics: RoiEfficiencyMetrics) => formatRoiDisplay(metrics.totalROI),
  },
  {
    key: "aiEfficiencyScore",
    getValue: (metrics: RoiEfficiencyMetrics) => formatScore(metrics.efficiencyScore),
  },
  {
    key: "wasteRatio",
    getValue: (metrics: RoiEfficiencyMetrics) =>
      `${formatNumber(metrics.wasteRatio * 100, 1)}%`,
  },
  {
    key: "costPerTask",
    getValue: (metrics: RoiEfficiencyMetrics) =>
      formatCurrencyPrecise(metrics.costPerSuccessfulTask),
  },
  {
    key: "hoursSaved",
    getValue: (metrics: RoiEfficiencyMetrics) =>
      formatNumber(metrics.hoursSaved),
  },
  {
    key: "costSavingsOpportunity",
    getValue: (metrics: RoiEfficiencyMetrics) =>
      formatCurrency(metrics.costSavingsOpportunity),
  },
];

export function RoiMetricsGrid({ metrics }: RoiMetricsGridProps) {
  const { t } = useTranslation("common");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {METRIC_CONFIG.map((metric) => (
        <DashboardCard
          key={metric.key}
          title={
            <span className="inline-flex items-center">
              {t(metric.key)}
              <InfoTooltip text={t(`roiMetricHelp.${metric.key}.formula`)} />
            </span>
          }
        >
          <p className="text-3xl font-bold text-foreground">
            {metric.getValue(metrics)}
          </p>
        </DashboardCard>
      ))}
    </div>
  );
}
