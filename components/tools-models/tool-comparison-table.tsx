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
import { formatCurrency, formatRoiDisplay } from "@/lib/format";
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
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-end font-mono" dir="ltr">
                {formatCurrency(row.spend)}
              </TableCell>
              <TableCell className="text-end" dir="ltr">
                {formatRoiDisplay(row.roi)}
              </TableCell>
              <TableCell className="text-end" dir="ltr">
                {row.totalSeats > 0
                  ? `${Math.round(row.seatUtilization * 100)}%`
                  : "—"}
              </TableCell>
              <TableCell className="text-end" dir="ltr">
                {row.requests.toLocaleString("en-US")}
              </TableCell>
              <TableCell className="text-end" dir="ltr">
                {row.hoursSaved.toLocaleString("en-US")}
              </TableCell>
              <TableCell className="text-end font-mono" dir="ltr">
                {formatCurrency(row.cpt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DashboardCard>
  );
}
