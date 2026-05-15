"use client";

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

interface ModelUsageTableProps {
  rows: ModelUsageRow[];
}

export function ModelUsageTable({ rows }: ModelUsageTableProps) {
  const { t } = useTranslation("common");

  return (
    <DashboardCard title={t("modelUsageBreakdown")}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("model")}</TableHead>
            <TableHead className="text-end">{t("spend")}</TableHead>
            <TableHead className="text-end">{t("requests")}</TableHead>
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
              <TableCell className="text-end font-mono">
                {formatCurrency(row.spend)}
              </TableCell>
              <TableCell className="text-end">
                {formatNumber(row.requests)}
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
