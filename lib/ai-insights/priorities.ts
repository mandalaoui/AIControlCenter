import type { AIInsight, AIInsightPriority, DashboardContext } from "@/lib/types";

const PRIORITY_ORDER: Record<AIInsightPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

interface PriorityScoreInputs {
  insight: AIInsight;
  context?: DashboardContext;
}

/** Internal scoring — not exposed to UI. */
function computePriorityScore({ insight, context }: PriorityScoreInputs): number {
  let score = 0;

  if (insight.estimatedSavings !== undefined) {
    score += Math.min(30, insight.estimatedSavings / 400);
  }

  const severityWeight: Record<AIInsight["severity"], number> = {
    info: 8,
    warning: 18,
    critical: 28,
  };
  score += severityWeight[insight.severity];

  score += insight.confidence * 18;

  const categoryWeight: Partial<Record<AIInsight["category"], number>> = {
    strategic: 12,
    risk: 14,
    financial: 10,
    governance: 9,
    "vendor-risk": 13,
    "pricing-shift": 10,
    "strategic-opportunity": 11,
    "market-change": 8,
  };
  score += categoryWeight[insight.category] ?? 5;

  if (insight.type === "risk") score += 8;
  if (insight.type === "anomaly" && insight.severity === "critical") score += 6;

  if (context) {
    const entity = insight.affectedEntity;
    const team = context.byTeam.find((t) => t.name === entity);
    if (team && team.spend > context.totalSpend * 0.2) score += 6;
    if (team && team.roi < context.totalROI * 0.7) score += 5;
  }

  return score;
}

function scoreToPriority(score: number): AIInsightPriority {
  if (score >= 68) return "critical";
  if (score >= 48) return "high";
  if (score >= 28) return "medium";
  return "low";
}

export function isInsightPriority(value: string): value is AIInsightPriority {
  return value === "low" || value === "medium" || value === "high" || value === "critical";
}

export function assignPriority(
  insight: AIInsight,
  context?: DashboardContext,
): AIInsight {
  if (insight.priority && isInsightPriority(insight.priority)) {
    return insight;
  }
  const score = computePriorityScore({ insight, context });
  return { ...insight, priority: scoreToPriority(score) };
}

export function sortInsightsByPriority(insights: AIInsight[]): AIInsight[] {
  return [...insights].sort(
    (a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority],
  );
}

export function deduplicateInsightIds(insights: AIInsight[]): AIInsight[] {
  const seen = new Set<string>();
  return insights.map((insight, index) => {
    let id = insight.id;
    if (seen.has(id)) {
      id = `${id}-${index}`;
    }
    seen.add(id);
    return { ...insight, id };
  });
}
