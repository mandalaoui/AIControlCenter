import type {
  AIInsight,
  AIInsightCategory,
  DashboardContext,
} from "@/lib/types";

import type { OrganizationalPattern } from "@/lib/ai-insights/insight-types";

const PREMIUM_MODELS = new Set(["GPT-4", "GPT-4o", "Claude Opus", "Gemini Ultra"]);

function normalizeEntity(entity: string): string {
  return entity.trim().toLowerCase();
}

export function detectOrganizationalPatterns(
  context: DashboardContext,
): OrganizationalPattern[] {
  const patterns: OrganizationalPattern[] = [];
  const totalModelSpend = context.byModel.reduce((sum, m) => sum + m.spend, 0);
  const premiumSpend = context.byModel
    .filter((m) => PREMIUM_MODELS.has(m.name))
    .reduce((sum, m) => sum + m.spend, 0);

  if (totalModelSpend > 0 && premiumSpend / totalModelSpend >= 0.45) {
    const topTeam = [...context.byTeam].sort((a, b) => b.spend - a.spend)[0];
    patterns.push({
      id: "pattern-premium-dependency",
      category: "strategic",
      narrative: `Premium-model spend represents a growing share of the AI portfolio${topTeam ? `, led by ${topTeam.name}` : ""}, while aggregate ROI remains at ${context.totalROI}%.`,
      whyThisMatters:
        "Leadership should treat premium-model concentration as a strategic dependency risk—cost scales faster than productivity when teams default to top-tier models for routine work.",
      affectedEntities: topTeam ? [topTeam.name] : [],
      severity: context.totalROI < 160 ? "warning" : "info",
      confidence: 0.82,
      estimatedSavings: Math.round(premiumSpend * 0.15),
    });
  }

  const lowRoiTeams = context.byTeam.filter((t) => t.roi < context.totalROI * 0.75);
  if (lowRoiTeams.length >= 2) {
    const names = lowRoiTeams.map((t) => t.name).join(", ");
    patterns.push({
      id: "pattern-roi-divergence",
      category: "efficiency",
      narrative: `ROI divergence is widening across ${names}—spend is rising without proportional value capture compared to the org baseline.`,
      whyThisMatters:
        "Uneven ROI across teams signals inconsistent AI operating maturity and raises the risk of budget scrutiny without clear business outcomes.",
      affectedEntities: lowRoiTeams.map((t) => t.name),
      severity: "warning",
      confidence: 0.78,
    });
  }

  const underusedTools = context.byTool.filter(
    (t) => t.totalSeats > 0 && t.seatUtilization < 0.35,
  );
  if (underusedTools.length >= 2) {
    patterns.push({
      id: "pattern-tool-sprawl",
      category: "operational",
      narrative: `Multiple tools (${underusedTools.map((t) => t.name).join(", ")}) show low seat utilization, suggesting overlapping workflows without consolidated ownership.`,
      whyThisMatters:
        "Tool sprawl inflates fixed costs and fragments governance—consolidation decisions should precede further license expansion.",
      affectedEntities: underusedTools.map((t) => t.name),
      severity: "info",
      confidence: 0.8,
      estimatedSavings: underusedTools.reduce(
        (sum, t) => sum + (t.totalSeats - t.activeSeats) * 28,
        0,
      ),
    });
  }

  if (context.lowProductivity.length >= 3) {
    patterns.push({
      id: "pattern-adoption-without-outcomes",
      category: "adoption",
      narrative: `${context.lowProductivity.length} high-spend users show productivity signals below team norms—adoption is outpacing effective usage patterns.`,
      whyThisMatters:
        "Raw adoption metrics can mask ineffective spend; targeted enablement protects ROI before costs compound across the organization.",
      affectedEntities: context.lowProductivity.slice(0, 3).map((u) => u.user),
      severity: "warning",
      confidence: 0.75,
    });
  }

  return patterns;
}

function buildCombinedNarrative(insights: AIInsight[]): string {
  const themes = insights.map((i) => i.title).join("; ");
  const primary = insights[0];
  if (!primary) return "";
  return `${primary.description} Related signals also indicate: ${themes}.`;
}

function mergeInsightGroup(group: AIInsight[]): AIInsight {
  const primary = group[0];
  if (group.length === 1) return primary;

  const categories = new Set(group.map((i) => i.category));
  const category: AIInsightCategory =
    categories.has("risk") ? "risk" :
    categories.has("strategic") ? "strategic" :
    primary.category;

  const maxSavings = Math.max(
    ...group.map((i) => i.estimatedSavings ?? 0),
  );
  const maxConfidence = Math.max(...group.map((i) => i.confidence));
  const severity = group.some((i) => i.severity === "critical")
    ? "critical"
    : group.some((i) => i.severity === "warning")
      ? "warning"
      : "info";

  return {
    ...primary,
    category,
    severity,
    description: buildCombinedNarrative(group),
    whyThisMatters:
      primary.whyThisMatters ||
      group.find((i) => i.whyThisMatters)?.whyThisMatters ||
      "",
    estimatedSavings: maxSavings > 0 ? maxSavings : primary.estimatedSavings,
    confidence: maxConfidence,
  };
}

export function mergeRelatedInsights(insights: AIInsight[]): AIInsight[] {
  const groups = new Map<string, AIInsight[]>();

  for (const insight of insights) {
    const key = normalizeEntity(insight.affectedEntity);
    const existing = groups.get(key) ?? [];
    existing.push(insight);
    groups.set(key, existing);
  }

  const merged: AIInsight[] = [];
  for (const group of groups.values()) {
    if (group.length >= 2 && group.every((i) => i.type !== "anomaly")) {
      merged.push(mergeInsightGroup(group));
    } else {
      merged.push(...group);
    }
  }

  return merged;
}

export function buildWhyThisMatters(
  insight: AIInsight,
  context: DashboardContext,
): string {
  if (insight.whyThisMatters?.trim()) {
    return insight.whyThisMatters.trim();
  }

  const team = context.byTeam.find((t) => t.name === insight.affectedEntity);
  const tool = context.byTool.find((t) => t.name === insight.affectedEntity);

  switch (insight.category) {
    case "financial":
      return team
        ? `${insight.affectedEntity} represents material spend (${Math.round((team.spend / context.totalSpend) * 100)}% of org AI budget)—leadership should align investment with measurable returns.`
        : "This spend pattern affects forecast accuracy and may require budget reallocation if ROI does not improve.";
    case "risk":
      return "Unchecked exposure here can compound into compliance, security, or vendor-lock-in concerns that are costlier to remediate later.";
    case "strategic":
      return "This pattern shapes how the organization scales AI capability—decisions now set the cost and governance trajectory for the next planning cycle.";
    case "adoption":
      return "Adoption velocity without outcome discipline is a leading indicator of future waste—executives should pair growth metrics with productivity evidence.";
    case "efficiency":
      return tool
        ? `Efficiency gaps in ${tool.name} directly erode ROI and inflate cost-per-outcome—operational course correction has near-term financial impact.`
        : "Efficiency drift increases cost-per-outcome and signals that model and workflow standards need reinforcement.";
    case "governance":
      return "Governance gaps create audit exposure and inconsistent AI practices across teams—standardization reduces both risk and redundant spend.";
    case "operational":
      return "Operational anomalies often precede budget overruns; early intervention prevents reactive firefighting at quarter end.";
    case "market":
      return "Market and vendor dynamics affect negotiation leverage and architecture choices—timing influences total cost of ownership.";
    case "market-change":
      return "Ecosystem shifts can obsolete current tool strategies—organizations that ignore market direction often overpay for redundant capabilities.";
    case "pricing-shift":
      return "Vendor pricing changes directly affect unit economics and renewal leverage—acting after contracts renew forfeits negotiation advantage.";
    case "strategic-opportunity":
      return "Market timing creates optionality to improve price/performance without waiting for internal crises—proactive pilots reduce lock-in to premium tiers.";
    case "vendor-risk":
      return "Vendor and governance pressures from the broader market raise accountability for provable ROI—internal waste becomes harder to defend externally.";
    default:
      return "This signal warrants executive attention because it connects usage telemetry to business outcomes, not just dashboard metrics.";
  }
}

export function applyStrategicNarratives(
  insights: AIInsight[],
  context: DashboardContext,
): AIInsight[] {
  const patterns = detectOrganizationalPatterns(context);
  if (patterns.length === 0) {
    return insights.map((insight) => ({
      ...insight,
      whyThisMatters: buildWhyThisMatters(insight, context),
    }));
  }

  const patternByEntity = new Map<string, OrganizationalPattern>();
  for (const pattern of patterns) {
    for (const entity of pattern.affectedEntities) {
      patternByEntity.set(normalizeEntity(entity), pattern);
    }
  }

  return insights.map((insight) => {
    const pattern = patternByEntity.get(normalizeEntity(insight.affectedEntity));
    const whyThisMatters = buildWhyThisMatters(insight, context);

    if (!pattern) {
      return { ...insight, whyThisMatters };
    }

    const description = insight.description.includes(pattern.narrative)
      ? insight.description
      : `${insight.description} ${pattern.narrative}`;

    return {
      ...insight,
      description,
      whyThisMatters: insight.whyThisMatters || pattern.whyThisMatters || whyThisMatters,
      category:
        insight.category === "operational" && pattern.category === "strategic"
          ? pattern.category
          : insight.category,
    };
  });
}

export function synthesizeInsights(
  insights: AIInsight[],
  context: DashboardContext,
): AIInsight[] {
  const withNarratives = applyStrategicNarratives(insights, context);
  return mergeRelatedInsights(withNarratives);
}
