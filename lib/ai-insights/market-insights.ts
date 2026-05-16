import type {
  AIInsight,
  DashboardContext,
  Model,
  Tool,
} from "@/lib/types";

import type {
  ExternalInsightContext,
  ExternalNewsSignal,
} from "@/lib/ai-insights/external-context";
import { findSignalsMatching } from "@/lib/ai-insights/external-context";

const CODING_TOOLS: Tool[] = ["GitHub Copilot", "Cursor"];

function modelSpend(context: DashboardContext, name: Model): number {
  return context.byModel.find((m) => m.name === name)?.spend ?? 0;
}

function toolSpend(context: DashboardContext, name: Tool): number {
  return context.byTool.find((t) => t.name === name)?.spend ?? 0;
}

function cite(signal: ExternalNewsSignal): string {
  return `Market signal (${signal.source}, ${signal.publishedAt}): "${signal.title}"`;
}

function marketInsight(
  partial: Omit<AIInsight, "externalSourceIds" | "priority"> & {
    externalSourceIds: string[];
  },
): AIInsight {
  return { priority: "medium", ...partial };
}

/**
 * Generates grounded market-aware insights by cross-referencing telemetry with
 * verified news signals only. Never invents external facts.
 */
export function generateMarketAwareInsights(
  context: DashboardContext,
  external: ExternalInsightContext,
): AIInsight[] {
  if (external.allSignals.length === 0) {
    return [];
  }

  const insights: AIInsight[] = [];
  const totalModelSpend = context.byModel.reduce((sum, m) => sum + m.spend, 0);

  const opusSpend = modelSpend(context, "Claude Opus");
  const sonnetSignals = findSignalsMatching(external, ["sonnet", "claude sonnet"]);
  if (opusSpend > 0 && sonnetSignals.length > 0 && totalModelSpend > 0) {
    const signal = sonnetSignals[0];
    const opusShare = Math.round((opusSpend / totalModelSpend) * 100);
    insights.push(
      marketInsight({
        id: `market-${signal.id}-opus-workflows`,
        type: "trend",
        severity: "info",
        category: "strategic-opportunity",
        title: "Premium Claude workflows may have mid-tier alternatives",
        description: `Engineering carries ${opusShare}% of model spend on Claude Opus while ${cite(signal)}. ${signal.summary} This suggests evaluating whether Opus-heavy workflows could shift to mid-tier models without sacrificing outcomes.`,
        whyThisMatters:
          "Vendor roadmap shifts create a strategic window to rebalance model mix before renewal cycles lock in premium-tier economics.",
        affectedEntity: "Claude Opus",
        confidence: 0.76,
        recommendedAction:
          "Ask platform leadership to pilot Sonnet-class routing on routine coding and analysis tasks before the next budget cycle.",
        externalSourceIds: [signal.id],
      }),
    );
  }

  const gpt4Spend =
    modelSpend(context, "GPT-4") + modelSpend(context, "GPT-4o");
  const miniPricingSignals = findSignalsMatching(external, [
    "gpt-4o-mini",
    "pricing",
    "token pricing",
  ]).filter((s) => s.category === "pricing");
  if (gpt4Spend > 0 && miniPricingSignals.length > 0) {
    const signal = miniPricingSignals[0];
    insights.push(
      marketInsight({
        id: `market-${signal.id}-gpt-pricing`,
        type: "trend",
        severity: "info",
        category: "pricing-shift",
        title: "OpenAI pricing shift may affect high-volume automations",
        description: `${cite(signal)}. ${signal.summary} With meaningful GPT-4 family spend in-period, classification and summarization pipelines are the most likely to benefit from repricing dynamics.`,
        whyThisMatters:
          "Pricing shifts are strategic inputs for contract negotiation and workload routing—not just incremental cost tweaks.",
        affectedEntity: "OpenAI API",
        confidence: 0.74,
        recommendedAction:
          "Review automation-heavy teams for workloads that could migrate to mini-tier models under the updated pricing structure.",
        externalSourceIds: [signal.id],
      }),
    );
  }

  const activeCodingTools = CODING_TOOLS.filter((t) => toolSpend(context, t) > 0);
  const consolidationSignals = findSignalsMatching(external, [
    "copilot",
    "agent mode",
    "coding assistant",
    "cursor",
  ]).filter((s) => s.category === "new-tools" || s.category === "industry");
  if (activeCodingTools.length >= 2 && consolidationSignals.length > 0) {
    const signal = consolidationSignals[0];
    insights.push(
      marketInsight({
        id: `market-${signal.id}-coding-consolidation`,
        type: "trend",
        severity: "info",
        category: "market-change",
        title: "Industry momentum toward consolidated coding-assistant platforms",
        description: `The organization runs overlapping coding assistants (${activeCodingTools.join(", ")}). ${cite(signal)}. ${signal.summary} Market direction favors consolidating IDE-native workflows rather than parallel premium subscriptions.`,
        whyThisMatters:
          "Tool consolidation is an operating-model decision—duplicate assistants inflate fixed cost without differentiated outcomes.",
        affectedEntity: activeCodingTools[0],
        confidence: 0.72,
        recommendedAction:
          "Frame a leadership discussion on primary vs. secondary coding platforms before expanding seat counts.",
        externalSourceIds: [signal.id],
      }),
    );
  }

  const geminiSpend =
    modelSpend(context, "Gemini Pro") + modelSpend(context, "Gemini Ultra");
  const geminiSignals = findSignalsMatching(external, ["gemini", "flash", "long-context", "context"]);
  if (geminiSpend > 0 && geminiSignals.length > 0) {
    const signal = geminiSignals[0];
    insights.push(
      marketInsight({
        id: `market-${signal.id}-gemini-research`,
        type: "trend",
        severity: "info",
        category: "strategic-opportunity",
        title: "Long-context Gemini options may reshape research workflows",
        description: `${cite(signal)}. ${signal.summary} Existing Gemini usage in-period indicates research and agent pipelines may be candidates for cost-aware context expansion.`,
        whyThisMatters:
          "Long-context models can reduce multi-step research chains—strategic if current workflows rely on repeated premium calls.",
        affectedEntity: "Google Gemini",
        confidence: 0.7,
        recommendedAction:
          "Identify research-heavy teams to assess whether Gemini-class long-context workflows reduce total call volume.",
        externalSourceIds: [signal.id],
      }),
    );
  }

  const governanceSignals = findSignalsMatching(external, [
    "governance",
    "board",
    "cfo",
    "cost dashboard",
  ]).filter((s) => s.category === "industry");
  if (context.wasteRatio > 0.18 && governanceSignals.length > 0) {
    const signal = governanceSignals[0];
    insights.push(
      marketInsight({
        id: `market-${signal.id}-governance-pressure`,
        type: "risk",
        severity: "warning",
        category: "vendor-risk",
        title: "Market pressure for AI spend governance aligns with internal waste signals",
        description: `${cite(signal)}. ${signal.summary} Internal waste ratio (${Math.round(context.wasteRatio * 100)}%) suggests the organization is exposed to the same board-level scrutiny described industry-wide.`,
        whyThisMatters:
          "External governance trends raise the bar for provable ROI—vendors and internal champions must justify spend with utilization evidence.",
        affectedEntity: "Organization",
        confidence: 0.78,
        recommendedAction:
          "Prepare an executive narrative linking utilization, ROI, and portfolio standards before finance-led reviews.",
        externalSourceIds: [signal.id],
      }),
    );
  }

  const msCopilotSpend = toolSpend(context, "Microsoft Copilot");
  const msPricingSignals = findSignalsMatching(external, ["microsoft", "copilot", "licensing", "usage-based"]);
  if (msCopilotSpend > 0 && msPricingSignals.length > 0) {
    const signal = msPricingSignals[0];
    insights.push(
      marketInsight({
        id: `market-${signal.id}-ms-licensing`,
        type: "trend",
        severity: "info",
        category: "pricing-shift",
        title: "Microsoft Copilot licensing models are shifting",
        description: `${cite(signal)}. ${signal.summary} Active Microsoft Copilot spend in-period makes licensing evolution a near-term portfolio planning variable.`,
        whyThisMatters:
          "Enterprise licensing shifts can change per-seat economics faster than usage patterns—impacting renewal leverage.",
        affectedEntity: "Microsoft Copilot",
        confidence: 0.73,
        recommendedAction:
          "Align procurement and IT on active-user definitions before the next Microsoft renewal conversation.",
        externalSourceIds: [signal.id],
      }),
    );
  }

  return insights.slice(0, 3);
}
