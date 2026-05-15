"use client";

import { useTranslation } from "react-i18next";

import { useAnalyze } from "@/components/ai/use-analyze";
import { RecommendationCard } from "@/components/optimization/recommendation-card";
import { AiErrorState } from "@/components/shared/ai-error-state";
import { InsightCardsSkeleton } from "@/components/shared/page-skeletons";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/format";

export function OptimizationContent() {
  const { t } = useTranslation("common");
  const { data, loading, error, refetch } = useAnalyze();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader titleKey="optimizationCenter" />
        <InsightCardsSkeleton count={4} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <PageHeader titleKey="optimizationCenter" />
        <AiErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  const totalSavings = data.recommendations.reduce(
    (sum, rec) => sum + rec.estimatedMonthlySavings,
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader titleKey="optimizationCenter" />
      <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
        {t("totalPotentialSavings", { amount: formatCurrency(totalSavings) })}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
          />
        ))}
      </div>
    </div>
  );
}
