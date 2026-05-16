import type { AIInsight, DashboardContext } from "@/lib/types";

import type { ExternalInsightContext } from "@/lib/ai-insights/external-context";
import { MARKET_INSIGHT_CATEGORIES } from "@/lib/ai-insights/categories";
import { buildOrganizationalSignalProfile } from "@/lib/ai-insights/signal-profile";
import { detectOrganizationalPatterns } from "@/lib/ai-insights/synthesis";
import { polishExecutiveTone } from "@/lib/ai-insights/quality-filter";

function isKpiHeavySummary(text: string): boolean {
  const kpiPatterns = [
    /^organization ai spend is/i,
    /^total spend is/i,
    /^total ai spend/i,
    /with \d+% roi and \d+ active users/i,
  ];
  return kpiPatterns.some((p) => p.test(text.trim()));
}

function topSpendTeam(context: DashboardContext) {
  return [...context.byTeam].sort((a, b) => b.spend - a.spend)[0];
}

function acceleratingTeams(context: DashboardContext) {
  return context.byTeam
    .filter((t) => t.efficiencyScore < context.efficiencyScore * 0.85)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 2);
}

function marketContextSentence(
  external: ExternalInsightContext | undefined,
  insights: AIInsight[],
): string | null {
  if (!external || external.allSignals.length === 0) {
    return null;
  }

  const marketInsight = insights.find((i) =>
    MARKET_INSIGHT_CATEGORIES.includes(
      i.category as (typeof MARKET_INSIGHT_CATEGORIES)[number],
    ),
  );
  if (marketInsight) {
    return `External ecosystem signals (${external.allSignals.length} verified updates) reinforce internal patterns—${marketInsight.title.toLowerCase()}.`;
  }

  const pricingSignal = external.pricingChanges[0];
  const modelSignal = external.newModels[0];
  if (pricingSignal && modelSignal) {
    return `The external AI market is shifting on both pricing (${pricingSignal.source}) and model capability (${modelSignal.source})—portfolio reviews should account for vendor evolution, not only internal telemetry.`;
  }

  if (external.industryTrends[0]) {
    return `${external.industryTrends[0].title}—leadership should align internal governance with industry direction.`;
  }

  return null;
}

export function buildStrategicExecutiveSummary(
  context: DashboardContext,
  insights: AIInsight[],
  external?: ExternalInsightContext,
): string {
  const profile = buildOrganizationalSignalProfile(context);
  const patterns = detectOrganizationalPatterns(context);
  const topTeam = topSpendTeam(context);
  const laggingTeams = acceleratingTeams(context);
  const criticalCount = insights.filter((i) => i.priority === "critical").length;
  const highCount = insights.filter((i) => i.priority === "high").length;
  const headlineStrategic = insights.find((i) => i.id.startsWith("strategic-"));

  const segments: string[] = [];

  if (headlineStrategic) {
    segments.push(headlineStrategic.description.split("What changed:")[0].trim());
  } else if (topTeam && laggingTeams.length > 0) {
    const lagNames = laggingTeams.map((t) => t.name).join(" and ");
    segments.push(
      `AI adoption continues to concentrate in ${topTeam.name}, while ${lagNames} show efficiency and ROI gaps relative to the org baseline.`,
    );
  } else if (topTeam) {
    segments.push(
      `${topTeam.name} drives the largest share of AI investment, setting the tone for how the organization scales usage.`,
    );
  }

  if (profile.standardizationGap >= 0.5 && profile.governancePressure >= 0.4) {
    segments.push(
      "Governance and standardization maturity lag adoption—portfolio decisions should emphasize operating discipline before further tool expansion.",
    );
  } else {
    const strategicPattern = patterns.find((p) => p.category === "strategic");
    if (strategicPattern) {
      segments.push(strategicPattern.narrative);
    } else if (context.wasteRatio > 0.2) {
      segments.push(
        "Premium workflows are scaling faster than measurable productivity—executives should expect questions on tier discipline and consolidation.",
      );
    }
  }

  const marketSentence = marketContextSentence(external, insights);
  if (marketSentence) {
    segments.push(marketSentence);
  } else if (criticalCount > 0 || highCount > 0) {
    segments.push(
      `${criticalCount + highCount} priority intelligence items require leadership review this period—focus on risk containment before incremental tool expansion.`,
    );
  } else {
    segments.push(
      "No critical escalations detected; maintain quarterly portfolio reviews to prevent silent cost drift.",
    );
  }

  return polishExecutiveTone(segments.join(" "));
}

export function refineExecutiveSummary(
  context: DashboardContext,
  insights: AIInsight[],
  existingSummary: string,
  external?: ExternalInsightContext,
): string {
  if (!existingSummary.trim() || isKpiHeavySummary(existingSummary)) {
    return buildStrategicExecutiveSummary(context, insights, external);
  }

  const summary = existingSummary.trim();
  if (external && external.allSignals.length > 0 && !/external|market|ecosystem|vendor/i.test(summary)) {
    const marketSentence = marketContextSentence(external, insights);
    if (marketSentence) {
      return `${summary} ${marketSentence}`;
    }
  }

  return polishExecutiveTone(summary);
}
