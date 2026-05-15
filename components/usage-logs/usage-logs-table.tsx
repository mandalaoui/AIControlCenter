"use client";

import { useMemo, useState } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ImpactBadge } from "@/components/shared/impact-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPaginatedLogs } from "@/lib/analytics";
import { formatCurrency, formatRoiDisplay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategorizedUsageLog } from "@/lib/types";

const PAGE_SIZE = 15;

interface UsageLogsTableProps {
  logs: CategorizedUsageLog[];
}

export function UsageLogsTable({ logs }: UsageLogsTableProps) {
  const { t, i18n } = useTranslation("common");

  function formatLogDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleString(i18n.language === "he" ? "he-IL" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const [page, setPage] = useState(1);

  const pagination = useMemo(
    () => getPaginatedLogs(logs, page, PAGE_SIZE),
    [logs, page],
  );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{t("date")}</TableHead>
              <TableHead>{t("team")}</TableHead>
              <TableHead>{t("user")}</TableHead>
              <TableHead>{t("tool")}</TableHead>
              <TableHead>{t("model")}</TableHead>
              <TableHead>{t("usageType")}</TableHead>
              <TableHead className="text-end">{t("spend")}</TableHead>
              <TableHead className="text-end">{t("estimatedROI")}</TableHead>
              <TableHead>{t("category")}</TableHead>
              <TableHead>{t("impactColumn")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.items.map((log, index) => (
              <TableRow
                key={log.id}
                className={cn(index % 2 === 0 && "bg-muted/20")}
              >
                <TableCell className="text-muted-foreground" dir="ltr">
                  {formatLogDate(log.date)}
                </TableCell>
                <TableCell>
                  <span className="inline-flex rounded border border-border bg-muted px-2 py-1 text-xs font-medium">
                    {log.team}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{log.user}</TableCell>
                <TableCell>{log.tool}</TableCell>
                <TableCell className="text-muted-foreground">
                  {log.model}
                </TableCell>
                <TableCell>{t(`usageTypes.${log.usageType}`)}</TableCell>
                <TableCell className="text-end font-mono" dir="ltr">
                  {formatCurrency(log.cost)}
                </TableCell>
                <TableCell className="text-end" dir="ltr">
                  <span className="inline-flex items-center justify-end gap-1 font-semibold text-green-500">
                    <TrendingUp className="h-3 w-3" aria-hidden />
                    {formatRoiDisplay(log.roi)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1 rounded border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs text-blue-500">
                    <Sparkles className="h-3 w-3" aria-hidden />
                    {t(`usageTypes.${log.categorization.category}`)}
                  </span>
                </TableCell>
                <TableCell>
                  <ImpactBadge level={log.categorization.impactLevel} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" dir="ltr">
          {t("paginationSummary", {
            from: (page - 1) * PAGE_SIZE + 1,
            to: Math.min(page * PAGE_SIZE, pagination.totalItems),
            total: pagination.totalItems,
          })}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
