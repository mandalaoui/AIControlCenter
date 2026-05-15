"use client";

import { useTranslation } from "react-i18next";

import { ToolModelTable } from "@/components/tools-directory/tool-model-table";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatCurrency, formatPercentChange, formatRoiDisplay } from "@/lib/format";
import type { AITool } from "@/lib/types";

interface ToolDetailSheetProps {
  tool: AITool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheetSide: "left" | "right";
}

export function ToolDetailSheet({
  tool,
  open,
  onOpenChange,
  sheetSide,
}: ToolDetailSheetProps) {
  const { t } = useTranslation("common");

  if (!tool) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={sheetSide} className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{tool.name}</SheetTitle>
          <SheetDescription>
            {tool.provider} · {t(`toolCategories.${tool.category}`)}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-8">
          <p className="text-sm text-muted-foreground">{tool.description}</p>

          <section>
            <h4 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {t("strengths")}
            </h4>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {tool.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {t("limitations")}
            </h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {tool.limitations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {t("modelComparison")}
            </h4>
            <ToolModelTable models={tool.models} />
          </section>

          <section>
            <h4 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {t("pricingPlansDetail")}
            </h4>
            <div className="space-y-3">
              {tool.pricing.map((plan) => (
                <div key={plan.name} className="rounded-md border border-border p-3">
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.priceMonthly > 0
                      ? `${formatCurrency(plan.priceMonthly)}/${t("perMonth")}`
                      : t("usageBasedPricing")}
                    {" · "}
                    {plan.per}
                  </p>
                  <p className="mt-1 text-sm">{plan.bestFor}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {t("recommendedUseCases")}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {tool.bestFor.map((usage) => (
                <Badge key={usage} variant="secondary">
                  {t(`usageTypes.${usage}`)}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {t("antiPatterns")}
            </h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-red-500">
              {tool.notRecommendedFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {tool.connectedInOrg && tool.orgSpend !== undefined ? (
            <section className="rounded-lg border border-border bg-muted/30 p-4">
              <h4 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {t("orgUsageStats")}
              </h4>
              <dl className="grid grid-cols-2 gap-3 text-sm" dir="ltr">
                <div>
                  <dt className="text-muted-foreground">{t("orgSpend")}</dt>
                  <dd className="font-semibold">{formatCurrency(tool.orgSpend)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("orgROI")}</dt>
                  <dd className="font-semibold text-green-500">
                    {formatRoiDisplay(tool.orgROI ?? 0)}
                  </dd>
                </div>
                {tool.orgSeatUtilization !== undefined ? (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">{t("seatUtilization")}</dt>
                    <dd className="font-semibold">
                      {formatPercentChange(tool.orgSeatUtilization * 100)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
