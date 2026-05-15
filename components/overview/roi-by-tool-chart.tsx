"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "react-i18next";

import { AiInsightBox } from "@/components/overview/ai-insight-box";
import { DashboardCard } from "@/components/dashboard-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatRoiDisplay } from "@/lib/format";
import type { ChartInsightData, RoiChartItem } from "@/lib/types";

const chartConfig = {
  roi: {
    label: "ROI",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

interface RoiByToolChartProps {
  data: RoiChartItem[];
  insight: ChartInsightData;
}

export function RoiByToolChart({ data, insight }: RoiByToolChartProps) {
  const { t } = useTranslation("common");

  return (
    <DashboardCard title={t("roiByTool")}>
      <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
        <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatRoiDisplay(Number(value))}
              />
            }
          />
          <Bar dataKey="roi" fill="var(--color-roi)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ChartContainer>
      <AiInsightBox insight={insight} className="mt-4" />
    </DashboardCard>
  );
}
