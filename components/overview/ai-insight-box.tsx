"use client";

import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { localizeAnomaly } from "@/lib/i18n/localize-content";
import { localizeInsightParams } from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";
import type { AnomalySummary, ChartInsightData } from "@/lib/types";

interface AiInsightBoxProps {
  insight:
    | ChartInsightData
    | Pick<ChartInsightData, "insightKey" | "insightParams">;
  className?: string;
}

export function AiInsightBox({ insight, className }: AiInsightBoxProps) {
  const { t } = useTranslation("common");

  const rawParams = insight.insightParams ?? {};
  const params = localizeInsightParams(rawParams, t);

  if (typeof params.anomalyId === "string") {
    params.detail = localizeAnomaly(
      {
        id: params.anomalyId,
        description: "",
        magnitude: "",
        affectedEntity: "",
        week: "",
        params: params.anomalyParams as AnomalySummary["params"],
      },
      t,
    ).description;
    delete params.anomalyId;
    delete params.anomalyParams;
  } else if (typeof params.toolCount === "number") {
    params.detail = t("kpiInsightsDetail.periodTotal", {
      count: params.toolCount,
    });
    delete params.toolCount;
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border border-blue-500/20 bg-muted/50 p-3 border-s-2 border-s-blue-500",
        className,
      )}
    >
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden />
      <p className="text-sm italic leading-relaxed text-muted-foreground">
        {t(insight.insightKey, params)}
      </p>
    </div>
  );
}
