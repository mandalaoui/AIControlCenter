"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";

import { AiInsightBox } from "@/components/overview/ai-insight-box";
import {
  formatCurrency,
  formatNumber,
  formatPercentChange,
  formatRoiDisplay,
  formatScore,
} from "@/lib/format";
import type { KpiCardData } from "@/lib/types";
import { cn } from "@/lib/utils";

const KPI_TITLE_KEYS: Record<KpiCardData["id"], string> = {
  totalSpend: "totalAISpend",
  roi: "estimatedROI",
  costSavingsOpportunity: "costSavingsOpportunity",
  hoursSaved: "hoursSaved",
  cpt: "costPerTask",
  efficiencyScore: "aiEfficiencyScore",
  activeUsers: "activeAIUsers",
  underusedSeats: "underusedSeats",
};

function formatKpiValue(kpi: KpiCardData): string {
  switch (kpi.format) {
    case "currency":
      return formatCurrency(kpi.value);
    case "percent":
      return formatRoiDisplay(kpi.value);
    case "score":
      return formatScore(kpi.value);
    default:
      return formatNumber(kpi.value);
  }
}

interface KpiCardProps {
  kpi: KpiCardData;
}

export function KpiCard({ kpi }: KpiCardProps) {
  const { t } = useTranslation("common");
  const isPositiveChange = kpi.changePercent > 0;
  const isGood =
    kpi.lowerIsBetter ? !isPositiveChange : isPositiveChange;
  const trendColor = isGood ? "text-green-500" : "text-red-500";
  const sparkColor = isGood ? "var(--color-chart-2)" : "var(--color-chart-5)";

  const chartData = kpi.trend.map((value, index) => ({ value, index }));

  return (
    <article className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-muted-foreground/30">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {t(KPI_TITLE_KEYS[kpi.id])}
        </h3>
        <div className="h-12 w-24 shrink-0" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparkColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-3xl font-bold text-foreground" dir="ltr">
        {formatKpiValue(kpi)}
      </p>

      <div className="mb-3 mt-2 flex items-center gap-2">
        {isPositiveChange ? (
          <TrendingUp className={cn("h-4 w-4", trendColor)} aria-hidden />
        ) : (
          <TrendingDown className={cn("h-4 w-4", trendColor)} aria-hidden />
        )}
        <span className={cn("text-sm font-medium", trendColor)} dir="ltr">
          {formatPercentChange(kpi.changePercent)}
        </span>
        <span className="text-xs text-muted-foreground">
          {t("vsPreviousPeriod")}
        </span>
      </div>

      <AiInsightBox insight={kpi} />
    </article>
  );
}
