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
import { getChartMargin } from "@/lib/i18n/chart-layout";
import { translateEntity } from "@/lib/i18n/labels";
import { formatRoiDisplay } from "@/lib/format";
import type { ChartInsightData, RoiChartItem } from "@/lib/types";

interface RoiByTeamChartProps {
  data: RoiChartItem[];
  insight: ChartInsightData;
}

export function RoiByTeamChart({ data, insight }: RoiByTeamChartProps) {
  const { t } = useTranslation("common");
  const chartConfig = {
    roi: {
      label: t("estimatedROI"),
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;
  const localizedData = data.map((item) => ({
    ...item,
    name: translateEntity(item.name, t),
  }));
  return (
    <DashboardCard title={t("roiByTeam")}>
      <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
        <BarChart data={localizedData} margin={getChartMargin()}>
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
