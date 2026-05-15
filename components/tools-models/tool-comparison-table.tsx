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
import { translateTool } from "@/lib/i18n/labels";
import { formatCurrency, formatNumber, formatRoiDisplay } from "@/lib/format";
import type { ToolComparisonRow } from "@/lib/types";

interface ToolComparisonTableProps {
  rows: ToolComparisonRow[];
}

export function ToolComparisonTable({ rows }: ToolComparisonTableProps) {
  const { t } = useTranslation("common");

  return (
    <DashboardCard title={t("toolComparison")}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("tool")}</TableHead>
            <TableHead className="text-end">{t("spend")}</TableHead>
            <TableHead className="text-end">{t("estimatedROI")}</TableHead>
            <TableHead className="text-end">{t("seatUtilization")}</TableHead>
            <TableHead className="text-end">{t("requests")}</TableHead>
            <TableHead className="text-end">{t("hoursSaved")}</TableHead>
            <TableHead className="text-end">{t("costPerTask")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell className="font-medium">
                {translateTool(row.name, t)}
              </TableCell>
              <TableCell className="text-end font-mono">
                {formatCurrency(row.spend)}
              </TableCell>
              <TableCell className="text-end">
                {formatRoiDisplay(row.roi)}
              </TableCell>
              <TableCell className="text-end">
                {row.totalSeats > 0
                  ? `${Math.round(row.seatUtilization * 100)}%`
                  : "—"}
              </TableCell>
              <TableCell className="text-end">
                {formatNumber(row.requests)}
              </TableCell>
              <TableCell className="text-end">
                {formatNumber(row.hoursSaved)}
              </TableCell>
              <TableCell className="text-end font-mono">
                {formatCurrency(row.cpt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}
