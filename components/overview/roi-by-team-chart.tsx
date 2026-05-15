"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
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
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface RoiByTeamChartProps {
  data: RoiChartItem[];
  insight: ChartInsightData;
}

export function RoiByTeamChart({ data, insight }: RoiByTeamChartProps) {
  const { t } = useTranslation("common");

  return (
    <DashboardCard title={t("roiByTeam")}>
      <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatRoiDisplay(Number(value))}
              />
            }
          />
          <ReferenceLine
            y={100}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="4 4"
          />
          <Bar dataKey="roi" fill="var(--color-roi)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
      <AiInsightBox insight={insight} className="mt-4" />
    </DashboardCard>
  );
}
