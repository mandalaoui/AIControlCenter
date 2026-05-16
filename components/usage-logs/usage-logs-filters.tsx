"use client";

import { useTranslation } from "react-i18next";

import { FilterSelect } from "@/components/shared/filter-select";
import { translateTeam } from "@/lib/i18n/labels";
import type {
  ProductivityLevel,
  Team,
  UsageLogsFilters,
  UsageType,
} from "@/lib/types";

const PRODUCTIVITY_LEVELS: ProductivityLevel[] = ["high", "medium", "low"];

interface UsageLogsFiltersBarProps {
  filters: UsageLogsFilters;
  purposes: UsageType[];
  teams: Team[];
  onChange: (filters: UsageLogsFilters) => void;
}

export function UsageLogsFiltersBar({
  filters,
  purposes,
  teams,
  onChange,
}: UsageLogsFiltersBarProps) {
  const { t } = useTranslation("common");

  const update = <K extends keyof UsageLogsFilters>(
    key: K,
    value: UsageLogsFilters[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
      <FilterSelect
        label={t("purposeFilter")}
        value={filters.purpose}
        onChange={(value) =>
          update("purpose", value as UsageLogsFilters["purpose"])
        }
        options={[
          { value: "all", label: t("allPurposes") },
          ...purposes.map((purpose) => ({
            value: purpose,
            label: t(`usageTypes.${purpose}`),
          })),
        ]}
      />
      <FilterSelect
        label={t("teamFilter")}
        value={filters.team}
        onChange={(value) => update("team", value as UsageLogsFilters["team"])}
        options={[
          { value: "all", label: t("allTeams") },
          ...teams.map((team) => ({
            value: team,
            label: translateTeam(team, t),
          })),
        ]}
      />
      <FilterSelect
        label={t("productivityFilter")}
        value={filters.productivity}
        onChange={(value) =>
          update("productivity", value as UsageLogsFilters["productivity"])
        }
        options={[
          { value: "all", label: t("allProductivityLevels") },
          ...PRODUCTIVITY_LEVELS.map((level) => ({
            value: level,
            label: t(`productivityLevel.${level}`),
          })),
        ]}
      />
    </div>
  );
}
