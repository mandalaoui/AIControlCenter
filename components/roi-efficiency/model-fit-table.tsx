"use client";

import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DashboardCard } from "@/components/dashboard-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { translateModel } from "@/lib/i18n/labels";
import { formatCurrency, formatNumber, formatRoiDisplay } from "@/lib/format";
import type { ModelUsageRow } from "@/lib/types";

interface ModelFitTableProps {
  rows: ModelUsageRow[];
}

export function ModelFitTable({ rows }: ModelFitTableProps) {
  const { t } = useTranslation("common");

  return (
    <DashboardCard
      title={t("modelFitAnalysis")}
      badge={
        <span className="inline-flex items-center gap-1 text-blue-500">
          <Sparkles className="h-3 w-3" aria-hidden />
          {t("aiAnalyzed")}
        </span>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("model")}</TableHead>
            <TableHead>{t("tier")}</TableHead>
            <TableHead className="text-end">{t("spend")}</TableHead>
            <TableHead className="text-end">{t("requests")}</TableHead>
            <TableHead className="text-end">{t("avgComplexity")}</TableHead>
            <TableHead className="text-end">{t("mismatchRate")}</TableHead>
            <TableHead className="text-end">{t("estimatedROI")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-medium">
                {translateModel(row.name, t)}
              </TableCell>
              <TableCell>{t(`modelTier.${row.tier}`)}</TableCell>
              <TableCell className="text-end font-mono">
                {formatCurrency(row.spend)}
              </TableCell>
              <TableCell className="text-end">
                {formatNumber(row.requests)}
              </TableCell>
              <TableCell className="text-end">
                {row.avgComplexityScore}
              </TableCell>
              <TableCell className="text-end">
                {Math.round(row.mismatchRate * 100)}%
              </TableCell>
              <TableCell className="text-end">
                {formatRoiDisplay(row.roi)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}
