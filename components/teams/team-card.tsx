"use client";

import { useTranslation } from "react-i18next";

import { DashboardCard } from "@/components/dashboard-card";
import { translateEntity, translateTool } from "@/lib/i18n/labels";
import { formatCurrency, formatNumber, formatRoiDisplay } from "@/lib/format";
import type { TeamDetailCard } from "@/lib/types";

interface TeamCardProps {
  team: TeamDetailCard;
}

export function TeamCard({ team }: TeamCardProps) {
  const { t } = useTranslation("common");
  const successRate =
    team.totalTasks > 0
      ? Math.round((team.successfulTasks / team.totalTasks) * 100)
      : 0;

  return (
    <DashboardCard title={translateEntity(team.name, t)}>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">{t("spend")}</dt>
          <dd className="font-semibold">
            {formatCurrency(team.spend)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("estimatedROI")}</dt>
          <dd className="font-semibold text-green-500">
            {formatRoiDisplay(team.roi)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("costPerTask")}</dt>
          <dd className="font-semibold">
            {formatCurrency(team.cpt)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("aiEfficiencyScore")}</dt>
          <dd className="font-semibold">
            {team.efficiencyScore}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("hoursSaved")}</dt>
          <dd className="font-semibold">
            {formatNumber(team.hoursSaved)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("activeAIUsers")}</dt>
          <dd className="font-semibold">
            {team.activeUsers}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("topTool")}</dt>
          <dd className="font-medium">{translateTool(team.topTool, t)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("taskSuccessRate")}</dt>
          <dd className="font-semibold">
            {successRate}%
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">{t("avgComplexity")}</dt>
          <dd className="font-semibold">
            {team.avgComplexityScore} / 10
          </dd>
        </div>
      </dl>
    </DashboardCard>
  );
}
