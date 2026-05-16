import type { AnalyzeResponseSchema } from "@/lib/ai/schemas";
import type { AnalyzeResponse, DashboardContext } from "@/lib/types";
import type { z } from "zod";

type RawAnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

import { assignCategory, inferCategoryFromInsight } from "@/lib/ai-insights/categories";
import { refineExecutiveSummary } from "@/lib/ai-insights/executive-summary";
import type { ExternalInsightContext } from "@/lib/ai-insights/external-context";
import type { EnrichInsightsOptions } from "@/lib/ai-insights/insight-types";
import { generateMarketAwareInsights } from "@/lib/ai-insights/market-insights";
import { filterInsightQuality } from "@/lib/ai-insights/quality-filter";
import {
  assignPriority,
  deduplicateInsightIds,
  sortInsightsByPriority,
} from "@/lib/ai-insights/priorities";
import { generateStrategicInsights } from "@/lib/ai-insights/strategic-insights";
import { synthesizeInsights } from "@/lib/ai-insights/synthesis";

export { INSIGHT_CATEGORIES, MARKET_INSIGHT_CATEGORIES } from "@/lib/ai-insights/categories";
export { buildStrategicExecutiveSummary } from "@/lib/ai-insights/executive-summary";
export {
  buildExternalContextFromNews,
  formatExternalContextForPrompt,
  loadExternalInsightContext,
} from "@/lib/ai-insights/external-context";
export { generateMarketAwareInsights } from "@/lib/ai-insights/market-insights";
export { generateStrategicInsights, buildOrganizationalSignalProfile } from "@/lib/ai-insights/strategic-insights";
export { filterInsightQuality } from "@/lib/ai-insights/quality-filter";
export type { EnrichInsightsOptions, OrganizationalPattern } from "@/lib/ai-insights/insight-types";
export type {
  ExternalInsightContext,
  ExternalNewsSignal,
} from "@/lib/ai-insights/external-context";
export type { OrganizationalSignalProfile } from "@/lib/ai-insights/signal-profile";

function mergeStrategicInsights(
  context: DashboardContext,
  insights: AIInsight[],
): AIInsight[] {
  const existingIds = new Set(insights.map((i) => i.id));
  const strategic = generateStrategicInsights(context).filter(
    (insight) => !existingIds.has(insight.id),
  );
  return deduplicateInsightIds([...strategic, ...insights]);
}

function mergeMarketInsights(
  context: DashboardContext,
  insights: AIInsight[],
  external: ExternalInsightContext | undefined,
): AIInsight[] {
  if (!external) {
    return insights;
  }

  const existingIds = new Set(insights.map((i) => i.id));
  const marketInsights = generateMarketAwareInsights(context, external).filter(
    (insight) => !existingIds.has(insight.id),
  );

  return deduplicateInsightIds([...insights, ...marketInsights]);
}

type AIInsight = AnalyzeResponse["insights"][number];

/**
 * Post-processes raw analyze output into strategic AI intelligence.
 * Keeps deterministic optimization recommendations untouched.
 */
export function enrichAnalyzeResponse(
  context: DashboardContext,
  response: RawAnalyzeResponse | AnalyzeResponse,
  options: EnrichInsightsOptions = {},
): AnalyzeResponse {
  const { synthesize = false, external } = options;

  let insights = response.insights.map((raw) => {
    const draft = {
      ...raw,
      category:
        raw.category ?? inferCategoryFromInsight(raw as Parameters<typeof inferCategoryFromInsight>[0]),
      priority: raw.priority ?? ("medium" as const),
      whyThisMatters: raw.whyThisMatters ?? "",
    } as AIInsight;
    return assignPriority(assignCategory(draft), context);
  });

  if (synthesize) {
    insights = synthesizeInsights(insights, context);
    insights = insights.map((insight) =>
      assignPriority(assignCategory(insight), context),
    );
  }

  insights = filterInsightQuality(insights, context, 8);

  const executiveSummary = refineExecutiveSummary(
    context,
    insights,
    response.executiveSummary,
    external,
  );

  return {
    insights,
    recommendations: response.recommendations,
    executiveSummary,
  };
}
