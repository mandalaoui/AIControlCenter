"use client";

import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type { ChartInsightData } from "@/lib/types";

interface AiInsightBoxProps {
  insight:
    | ChartInsightData
    | Pick<ChartInsightData, "insightKey" | "insightParams">;
  className?: string;
}

export function AiInsightBox({ insight, className }: AiInsightBoxProps) {
  const { t } = useTranslation("common");

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md border border-blue-500/20 bg-muted/50 p-3 border-s-2 border-s-blue-500",
        className,
      )}
    >
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden />
      <p className="text-sm italic leading-relaxed text-muted-foreground">
        {t(insight.insightKey, insight.insightParams)}
      </p>
    </div>
  );
}
