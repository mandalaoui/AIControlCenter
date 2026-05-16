"use client";

import { Cell, Pie, PieChart } from "recharts";
import { useTranslation } from "react-i18next";

import { DashboardCard } from "@/components/dashboard-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format";
import type { ProviderSpendItem } from "@/lib/types";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function buildChartConfig(
  data: ProviderSpendItem[],
  t: (key: string) => string,
): ChartConfig {
  return Object.fromEntries(
    data.map((item, index) => [
      item.providerKey,
      {
        label: t(`providers.${item.providerKey}`),
        color: CHART_COLORS[index % CHART_COLORS.length],
      },
    ]),
  );
}

interface SpendByProviderChartProps {
  data: ProviderSpendItem[];
}

export function SpendByProviderChart({ data }: SpendByProviderChartProps) {
  const { t } = useTranslation("common");
  const chartConfig = buildChartConfig(data, t);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const pieData = data.map((item) => ({
    ...item,
    fill: `var(--color-${item.providerKey})`,
  }));

  // Debug logs
  console.log("pieData", pieData);
  console.log("chartConfig", chartConfig);

  return (
    <DashboardCard title={t("spendByProvider")}>
      <div className="relative">
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <PieChart>
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0];
              const providerKey = item.payload.providerKey as string;
              const label = chartConfig[providerKey]?.label ?? providerKey;
              return (
                <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md">
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-muted-foreground">{formatCurrency(Number(item.value))}</p>
                </div>
              );
            }}
          />
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="providerKey"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {pieData.map((entry) => (
                <Cell
                  key={entry.providerKey}
                  fill={`var(--color-${entry.providerKey})`}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground">
              {t("total")}
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatCurrency(total)}
            </p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
