"use client";

import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { translateTool } from "@/lib/i18n/labels";
import { localizeToolContent } from "@/lib/i18n/localize-content";
import { formatCurrency, formatRoiDisplay } from "@/lib/format";
import type { AITool } from "@/lib/types";

interface ToolCardProps {
  tool: AITool;
  onSelect: (tool: AITool) => void;
}

export function ToolCard({ tool, onSelect }: ToolCardProps) {
  const { t } = useTranslation("common");
  const localized = localizeToolContent(tool, t);
  const topStrengths = localized.strengths.slice(0, 3);
  const pricingSummary = localized.pricing
    .slice(0, 2)
    .map((plan) => plan.name)
    .join(" · ");

  return (
    <button
      type="button"
      onClick={() => onSelect(tool)}
      className="flex h-full flex-col rounded-lg border border-border bg-card p-5 text-start transition-colors hover:bg-accent/50"
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground">
            {translateTool(tool.name, t)}
          </h3>
          <p className="text-sm text-muted-foreground">{tool.provider}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{t(`toolCategories.${tool.category}`)}</Badge>
          {tool.connectedInOrg ? (
            <Badge variant="outline" className="border-green-500/40 text-green-500">
              {t("connected")}
            </Badge>
          ) : null}
        </div>
      </div>

      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
        {localized.description}
      </p>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {topStrengths.map((strength) => (
          <span
            key={strength}
            className="rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-600 dark:text-green-400"
          >
            {strength}
          </span>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {tool.bestFor.map((usage) => (
          <Badge key={usage} variant="secondary" className="text-xs">
            {t(`usageTypes.${usage}`)}
          </Badge>
        ))}
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        {t("pricingPlans")}: {pricingSummary}
      </p>

      {tool.connectedInOrg && tool.orgSpend !== undefined ? (
        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border pt-3 text-sm">
          <div>
            <span className="text-muted-foreground">{t("orgSpend")}</span>
            <p className="font-semibold">{formatCurrency(tool.orgSpend)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{t("orgROI")}</span>
            <p className="font-semibold text-green-500">
              {formatRoiDisplay(tool.orgROI ?? 0)}
            </p>
          </div>
        </div>
      ) : null}
    </button>
  );
}
