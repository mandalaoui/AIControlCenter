"use client";

import { useTranslation } from "react-i18next";

import { DashboardCard } from "@/components/dashboard-card";
import { formatCurrency, formatRoiDisplay } from "@/lib/format";
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
    <DashboardCard title={team.name}>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">{t("spend")}</dt>
          <dd className="font-semibold" dir="ltr">
            {formatCurrency(team.spend)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("estimatedROI")}</dt>
          <dd className="font-semibold text-green-500" dir="ltr">
            {formatRoiDisplay(team.roi)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("costPerTask")}</dt>
          <dd className="font-semibold" dir="ltr">
            {formatCurrency(team.cpt)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("aiEfficiencyScore")}</dt>
          <dd className="font-semibold" dir="ltr">
            {team.efficiencyScore}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("hoursSaved")}</dt>
          <dd className="font-semibold" dir="ltr">
            {team.hoursSaved.toLocaleString("en-US")}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("activeAIUsers")}</dt>
          <dd className="font-semibold" dir="ltr">
            {team.activeUsers}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("topTool")}</dt>
          <dd className="font-medium">{team.topTool}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("taskSuccessRate")}</dt>
          <dd className="font-semibold" dir="ltr">
            {successRate}%
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">{t("avgComplexity")}</dt>
          <dd className="font-semibold" dir="ltr">
            {team.avgComplexityScore} / 10
          </dd>
        </div>
      </dl>
    </DashboardCard>
  );
}
