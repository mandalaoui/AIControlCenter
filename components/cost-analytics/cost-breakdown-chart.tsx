"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useTranslation } from "react-i18next";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";
import type { CostBreakdownRow } from "@/lib/types";

const chartConfig = {
  spend: { label: "Spend", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface CostBreakdownChartProps {
  rows: CostBreakdownRow[];
}

export function CostBreakdownChart({ rows }: CostBreakdownChartProps) {
  const { t } = useTranslation("common");

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {t("noDataForFilters")}
      </p>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
        <YAxis tickLine={false} axisLine={false} width={56} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value))}
            />
          }
        />
        <Bar dataKey="spend" fill="var(--color-spend)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
