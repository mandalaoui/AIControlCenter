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
import { getVerticalBarChartMargin } from "@/lib/i18n/chart-layout";
import { translateTool } from "@/lib/i18n/labels";
import { formatRoiDisplay } from "@/lib/format";
import type { ChartInsightData, RoiChartItem } from "@/lib/types";

interface RoiByToolChartProps {
  data: RoiChartItem[];
  insight: ChartInsightData;
}

export function RoiByToolChart({ data, insight }: RoiByToolChartProps) {
  const { t } = useTranslation("common");
  const chartConfig = {
    roi: {
      label: t("estimatedROI"),
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;
  const localizedData = data.map((item) => ({
    ...item,
    name: translateTool(item.name, t),
  }));
  return (
    <DashboardCard title={t("roiByTool")}>
      <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
        <BarChart
          data={localizedData}
          layout="vertical"
          margin={getVerticalBarChartMargin()}
        >
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
          <Bar dataKey="roi" fill="var(--color-roi)" radius={[4, 0, 0, 4]} />
        </BarChart>
      </ChartContainer>
      <AiInsightBox insight={insight} className="mt-4" />
    </DashboardCard>
  );
}
