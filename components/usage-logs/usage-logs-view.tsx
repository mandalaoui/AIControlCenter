"use client";

import { useMemo, useState } from "react";

import { UsageLogsCategorization } from "@/components/usage-logs/usage-logs-categorization";
import { UsageLogsFiltersBar } from "@/components/usage-logs/usage-logs-filters";
import { UsageLogsTable } from "@/components/usage-logs/usage-logs-table";
import {
  filterCategorizedUsageLogs,
  getUsageLogsFilterOptions,
} from "@/lib/analytics";
import type { CategorizedUsageLog, UsageLogsFilters } from "@/lib/types";

const DEFAULT_FILTERS: UsageLogsFilters = {
  purpose: "all",
  team: "all",
  productivity: "all",
};

interface UsageLogsViewProps {
  logs: CategorizedUsageLog[];
}

export function UsageLogsView({ logs }: UsageLogsViewProps) {
  const [filters, setFilters] = useState<UsageLogsFilters>(DEFAULT_FILTERS);

  const { purposes, teams } = useMemo(
    () => getUsageLogsFilterOptions(logs),
    [logs],
  );

  const filteredLogs = useMemo(
    () => filterCategorizedUsageLogs(logs, filters),
    [logs, filters],
  );

  return (
    <>
      <UsageLogsCategorization logs={filteredLogs} />
      <UsageLogsFiltersBar
        filters={filters}
        purposes={purposes}
        teams={teams}
        onChange={setFilters}
      />
      <UsageLogsTable logs={filteredLogs} />
    </>
  );
}
