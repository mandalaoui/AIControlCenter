"use client";

import { useTranslation } from "react-i18next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { translateEntity } from "@/lib/i18n/labels";
import { formatCurrency, formatNumber, formatRoiDisplay } from "@/lib/format";
import type { CostBreakdownRow } from "@/lib/types";

interface CostBreakdownTableProps {
  rows: CostBreakdownRow[];
}

export function CostBreakdownTable({ rows }: CostBreakdownTableProps) {
  const { t } = useTranslation("common");

  if (rows.length === 0) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("breakdownLabel")}</TableHead>
          <TableHead className="text-end">{t("spend")}</TableHead>
          <TableHead className="text-end">{t("share")}</TableHead>
          <TableHead className="text-end">{t("estimatedROI")}</TableHead>
          <TableHead className="text-end">{t("hoursSaved")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key}>
            <TableCell className="font-medium">
              {translateEntity(row.label, t)}
            </TableCell>
            <TableCell className="text-end font-mono">
              {formatCurrency(row.spend)}
            </TableCell>
            <TableCell className="text-end">
              {row.sharePercent}%
            </TableCell>
            <TableCell className="text-end">
              {formatRoiDisplay(row.roi)}
            </TableCell>
            <TableCell className="text-end">
              {formatNumber(row.hoursSaved)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
