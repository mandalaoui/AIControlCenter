"use client";

import { TrendingDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DashboardCard } from "@/components/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { localizeRecommendation } from "@/lib/i18n/localize-content";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OptimizationRecommendation } from "@/lib/types";

const RISK_CLASS: Record<
  OptimizationRecommendation["riskLevel"],
  string
> = {
  low: "border-green-500/40 text-green-600 dark:text-green-400",
  medium: "border-amber-500/40 text-amber-600 dark:text-amber-400",
  high: "border-red-500/40 text-red-600 dark:text-red-400",
};

interface RecommendationCardProps {
  recommendation: OptimizationRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { t } = useTranslation("common");
  const rec = localizeRecommendation(recommendation, t);

  return (
    <DashboardCard
      title={rec.title}
      badge={
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-green-500">
          <TrendingDown className="h-3.5 w-3.5" aria-hidden />
          {formatCurrency(rec.estimatedMonthlySavings)}/{t("perMonthShort")}
        </span>
      }
    >
      <p className="mb-3 text-sm text-muted-foreground">
        {rec.description}
      </p>
      <p className="mb-4 text-xs text-muted-foreground">{rec.evidence}</p>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn(RISK_CLASS[rec.riskLevel])}
        >
          {t(`riskLevel.${rec.riskLevel}`)}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {t("confidence")}: {Math.round(rec.confidence * 100)}%
        </span>
        <Badge variant="outline">{t(`recCategory.${rec.category}`)}</Badge>
      </div>
    </DashboardCard>
  );
}
