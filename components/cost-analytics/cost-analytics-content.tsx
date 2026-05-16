"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components/shared/page-header";
import { CostBreakdownChart } from "@/components/cost-analytics/cost-breakdown-chart";
import { CostBreakdownTable } from "@/components/cost-analytics/cost-breakdown-table";
import { DashboardCard } from "@/components/dashboard-card";
import { FilterSelect } from "@/components/shared/filter-select";
import { getCostBreakdown, getAvailableMonths } from "@/lib/analytics";
import type {
  CostAnalyticsFilters,
  CostBreakdownDimension,
  Team,
  Tool,
  UsageLog,
  Model
} from "@/lib/types";

interface CostAnalyticsContentProps {
  logs: UsageLog[];
  teams: Team[];
  tools: Tool[];
  models: Model[];
}

export function CostAnalyticsContent({
  logs,
  teams,
  tools,
  models
}: CostAnalyticsContentProps) {
  const { t } = useTranslation("common");
  const months = useMemo(() => getAvailableMonths(logs), [logs]);

  const [filters, setFilters] = useState<CostAnalyticsFilters>({
    dimension: "team",
    team: "all",
    tool: "all",
    month: "all",
    model: "all",
  });

  const rows = useMemo(
    () => getCostBreakdown(logs, filters),
    [logs, filters],
  );

  const update = <K extends keyof CostAnalyticsFilters>(
    key: K,
    value: CostAnalyticsFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader titleKey="costAnalytics" />
      <DashboardCard title={t("filters")}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label={t("breakdownBy")}
            value={filters.dimension}
            onChange={(value) =>
              update("dimension", value as CostBreakdownDimension)
            }
            options={[
              { value: "team", label: t("teams") },
              { value: "tool", label: t("tool") },
              { value: "month", label: t("month") },
              { value: "model", label: t("model") },
            ]}
          />
          <FilterSelect
            label={t("teamFilter")}
            value={filters.team}
            onChange={(value) => update("team", value as Team | "all")}
            options={[
              { value: "all", label: t("allTeams") },
              ...teams.map((team) => ({ value: team, label: team })),
            ]}
          />
          <FilterSelect
            label={t("toolFilter")}
            value={filters.tool}
            onChange={(value) => update("tool", value as Tool | "all")}
            options={[
              { value: "all", label: t("allTools") },
              ...tools.map((tool) => ({ value: tool, label: tool })),
            ]}
          />
          <FilterSelect
            label={t("monthFilter")}
            value={filters.month}
            onChange={(value) => update("month", value)}
            options={[
              { value: "all", label: t("allMonths") },
              ...months.map((month) => ({ value: month, label: month })),
            ]}
          />
          <FilterSelect
            label={t("model")}
            value={filters.model}
            onChange={(value) => update("model", value as Model | "all")}
            options={[
              { value: "all", label: t("allModels") },
              ...models.map((model) => ({ value: model, label: model })),
            ]}
          />
        </div>
      </DashboardCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardCard title={t("costBreakdownChart")}>
          <CostBreakdownChart rows={rows} />
        </DashboardCard>
        <DashboardCard title={t("costBreakdownTable")}>
          <CostBreakdownTable rows={rows} />
        </DashboardCard>
      </div>
    </div>
  );
}
