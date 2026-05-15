"use client";

import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DashboardCard } from "@/components/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { localizeInsight } from "@/lib/i18n/localize-content";
import { translateEntity } from "@/lib/i18n/labels";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AIInsight, AIInsightSeverity } from "@/lib/types";

const SEVERITY_CLASS: Record<AIInsightSeverity, string> = {
  info: "border-blue-500/40 text-blue-600 dark:text-blue-400",
  warning: "border-amber-500/40 text-amber-600 dark:text-amber-400",
  critical: "border-red-500/40 text-red-600 dark:text-red-400",
};

interface InsightCardProps {
  insight: AIInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const { t } = useTranslation("common");
  const localized = localizeInsight(insight, t);

  return (
    <DashboardCard
      title={localized.title}
      badge={
        <Badge
          variant="outline"
          className={cn(SEVERITY_CLASS[insight.severity])}
        >
          {t(`insightSeverity.${insight.severity}`)}
        </Badge>
      }
    >
      <p className="mb-3 text-sm text-muted-foreground">{localized.description}</p>
      <div className="mb-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>
          {t("affectedEntity")}: {translateEntity(localized.affectedEntity, t)}
        </span>
        <span>
          {t("confidence")}: {Math.round(insight.confidence * 100)}%
        </span>
        {insight.estimatedSavings !== undefined ? (
          <span>
            {t("potentialSavings")}: {formatCurrency(insight.estimatedSavings)}
          </span>
        ) : null}
      </div>
      <div className="flex items-start gap-2 rounded-md border border-s-2 border-s-blue-500 bg-muted/50 p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden />
        <p className="text-sm italic text-muted-foreground">
          {localized.recommendedAction}
        </p>
      </div>
    </DashboardCard>
  );
}
