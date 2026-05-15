"use client";

import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ToolModelInfo } from "@/lib/types";

interface ToolModelTableProps {
  models: ToolModelInfo[];
}

export function ToolModelTable({ models }: ToolModelTableProps) {
  const { t } = useTranslation("common");

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("model")}</TableHead>
            <TableHead dir="ltr">{t("contextWindow")}</TableHead>
            <TableHead dir="ltr">{t("inputPrice")}</TableHead>
            <TableHead dir="ltr">{t("outputPrice")}</TableHead>
            <TableHead>{t("speed")}</TableHead>
            <TableHead>{t("recommended")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model) => (
            <TableRow key={model.name}>
              <TableCell className="font-medium">{model.displayName}</TableCell>
              <TableCell dir="ltr">
                {model.contextWindow.toLocaleString("en-US")}
              </TableCell>
              <TableCell dir="ltr">${model.inputPricePer1M.toFixed(2)}</TableCell>
              <TableCell dir="ltr">${model.outputPricePer1M.toFixed(2)}</TableCell>
              <TableCell>{t(`modelSpeed.${model.speed}`)}</TableCell>
              <TableCell>
                {model.recommended ? (
                  <Check className="size-4 text-green-500" aria-label={t("recommended")} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
