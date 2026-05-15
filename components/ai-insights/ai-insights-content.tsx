"use client";

import { useTranslation } from "react-i18next";

import { useAnalyze } from "@/components/ai/use-analyze";
import { InsightCard } from "@/components/ai-insights/insight-card";
import { AiErrorState } from "@/components/shared/ai-error-state";
import { InsightCardsSkeleton } from "@/components/shared/page-skeletons";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardCard } from "@/components/dashboard-card";

export function AiInsightsContent() {
  const { t } = useTranslation("common");
  const { data, loading, error, refetch } = useAnalyze();

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader titleKey="aiInsights" badgeKey="aiAnalyzed" />
        <InsightCardsSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <PageHeader titleKey="aiInsights" badgeKey="aiAnalyzed" />
        <AiErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader titleKey="aiInsights" badgeKey="aiAnalyzed" />
      <DashboardCard title={t("executiveSummary")}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {data.executiveSummary}
        </p>
      </DashboardCard>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}
