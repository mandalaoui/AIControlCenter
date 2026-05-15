"use client";

import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { KpiGrid } from "@/components/overview/kpi-grid";
import { RoiByTeamChart } from "@/components/overview/roi-by-team-chart";
import { RoiByToolChart } from "@/components/overview/roi-by-tool-chart";
import { SpendByProviderChart } from "@/components/overview/spend-by-provider-chart";
import { SpendOverTimeChart } from "@/components/overview/spend-over-time-chart";
import type { OverviewPageData } from "@/lib/types";

interface OverviewPageProps {
  data: OverviewPageData;
}

export function OverviewPage({ data }: OverviewPageProps) {
  const { t } = useTranslation("common");

  return (
    <div className="space-y-10 animate-in fade-in duration-150">
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold text-foreground">
          {t("executiveOverview")}
        </h2>
        <KpiGrid kpis={data.kpis} />
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {t("roiAnalysis")}
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-muted/50 px-2 py-1 text-xs font-medium text-blue-500">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("aiAnalyzed")}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RoiByTeamChart
            data={data.roiByTeam}
            insight={data.roiByTeamInsight}
          />
          <RoiByToolChart
            data={data.roiByTool}
            insight={data.roiByToolInsight}
          />
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold text-foreground">
          {t("costBreakdown")}
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SpendByProviderChart data={data.spendByProvider} />
          <SpendOverTimeChart data={data.spendOverTime} />
        </div>
      </section>
    </div>
  );
}
