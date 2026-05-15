"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type { ImpactLevel } from "@/lib/types";

interface ImpactBadgeProps {
  level: ImpactLevel;
}

const IMPACT_STYLE: Record<ImpactLevel, string> = {
  "high-impact":
    "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400",
  "medium-impact":
    "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "high-cost":
    "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
  waste: "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400",
};

export function ImpactBadge({ level }: ImpactBadgeProps) {
  const { t } = useTranslation("common");
  const isWaste = level === "waste";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium",
        IMPACT_STYLE[level],
      )}
    >
      {isWaste ? <AlertTriangle className="h-3 w-3" aria-hidden /> : null}
      {t(`impact.${level}`)}
    </span>
  );
}
