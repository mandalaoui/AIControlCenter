"use client";

import { useMemo } from "react";
import { Layers, Sparkles, TrendingUp, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import { getUsageLogsCategorizationSummary } from "@/lib/analytics";
import type { CategorizedUsageLog } from "@/lib/types";

interface UsageLogsCategorizationProps {
  logs: CategorizedUsageLog[];
}

function productivityPercent(count: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((count / total) * 100);
}

export function UsageLogsCategorization({ logs }: UsageLogsCategorizationProps) {
  const { t } = useTranslation("common");
  const summary = useMemo(
    () => getUsageLogsCategorizationSummary(logs),
    [logs],
  );

  const { totalLogs, productivity } = summary;
  const highPct = productivityPercent(productivity.high, totalLogs);
  const mediumPct = productivityPercent(productivity.medium, totalLogs);
  const lowPct = productivityPercent(productivity.low, totalLogs);

  const dimensions = [
    {
      icon: Layers,
      label: t("smartCategorization.purpose"),
      detail: t("smartCategorization.purposeSummary", {
        count: summary.purposeCount,
      }),
    },
    {
      icon: Users,
      label: t("smartCategorization.team"),
      detail: t("smartCategorization.teamSummary", {
        count: summary.teamCount,
      }),
    },
    {
      icon: TrendingUp,
      label: t("smartCategorization.productivity"),
      detail: t("smartCategorization.productivitySummary", {
        high: highPct,
        medium: mediumPct,
        low: lowPct,
      }),
    },
  ] as const;

  return (
    <section className="rounded-lg border border-blue-500/20 bg-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-blue-500" aria-hidden />
            {t("smartCategorization.title")}
          </h3>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {t("smartCategorization.description")}
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-3">
          {dimensions.map(({ icon: Icon, label, detail }) => (
            <div
              key={label}
              className="rounded-md border border-border bg-muted/30 px-3 py-2.5"
            >
              <p className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                {label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
