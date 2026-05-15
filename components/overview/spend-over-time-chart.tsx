"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";

import { DashboardCard } from "@/components/dashboard-card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";
import { SPEND_LINE_KEYS } from "@/lib/overview";
import type { SpendOverTimePoint } from "@/lib/types";

function buildLineConfig(t: (key: string) => string): ChartConfig {
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];
  return Object.fromEntries(
    SPEND_LINE_KEYS.map((key, index) => [
      key,
      {
        label: t(`spendLines.${key}`),
        color: colors[index],
      },
    ]),
  );
}

interface SpendOverTimeChartProps {
  data: SpendOverTimePoint[];
}

export function SpendOverTimeChart({ data }: SpendOverTimeChartProps) {
  const { t } = useTranslation("common");
  const chartConfig = buildLineConfig(t);

  return (
    <DashboardCard title={t("spendOverTime")}>
      <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={56} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatCurrency(Number(value))}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {SPEND_LINE_KEYS.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </DashboardCard>
  );
}
