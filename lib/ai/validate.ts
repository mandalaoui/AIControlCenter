import type {
  AIInsight,
  AIInsightSeverity,
  AIInsightType,
  AnalyzeResponse,
  OptimizationRecommendation,
} from "@/lib/types";

const INSIGHT_TYPES: AIInsightType[] = [
  "anomaly",
  "trend",
  "recommendation",
  "risk",
];
const INSIGHT_SEVERITIES: AIInsightSeverity[] = ["info", "warning", "critical"];
const RISK_LEVELS: OptimizationRecommendation["riskLevel"][] = [
  "low",
  "medium",
  "high",
];
const REC_CATEGORIES: OptimizationRecommendation["category"][] = [
  "model-switch",
  "seat-reduction",
  "workflow",
  "tool-consolidation",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

function parseInsight(value: unknown): AIInsight | null {
  if (!isRecord(value)) {
    return null;
  }
  if (
    !isString(value.id) ||
    !isString(value.title) ||
    !isString(value.description) ||
    !isString(value.affectedEntity) ||
    !isString(value.recommendedAction) ||
    !isNumber(value.confidence) ||
    !INSIGHT_TYPES.includes(value.type as AIInsightType) ||
    !INSIGHT_SEVERITIES.includes(value.severity as AIInsightSeverity)
  ) {
    return null;
  }

  return {
    id: value.id,
    type: value.type as AIInsightType,
    severity: value.severity as AIInsightSeverity,
    title: value.title,
    description: value.description,
    affectedEntity: value.affectedEntity,
    estimatedSavings:
      value.estimatedSavings === undefined
        ? undefined
        : isNumber(value.estimatedSavings)
          ? value.estimatedSavings
          : undefined,
    confidence: Math.min(1, Math.max(0, value.confidence)),
    recommendedAction: value.recommendedAction,
  };
}

function parseRecommendation(
  value: unknown,
): OptimizationRecommendation | null {
  if (!isRecord(value)) {
    return null;
  }
  if (
    !isString(value.id) ||
    !isString(value.title) ||
    !isString(value.description) ||
    !isString(value.evidence) ||
    !isNumber(value.confidence) ||
    !isNumber(value.estimatedMonthlySavings) ||
    !RISK_LEVELS.includes(value.riskLevel as OptimizationRecommendation["riskLevel"]) ||
    !REC_CATEGORIES.includes(
      value.category as OptimizationRecommendation["category"],
    )
  ) {
    return null;
  }

  return {
    id: value.id,
    title: value.title,
    description: value.description,
    evidence: value.evidence,
    riskLevel: value.riskLevel as OptimizationRecommendation["riskLevel"],
    confidence: Math.min(1, Math.max(0, value.confidence)),
    estimatedMonthlySavings: value.estimatedMonthlySavings,
    category: value.category as OptimizationRecommendation["category"],
  };
}

export function parseAnalyzeResponse(value: unknown): AnalyzeResponse | null {
  if (!isRecord(value)) {
    return null;
  }
  if (!Array.isArray(value.insights) || !Array.isArray(value.recommendations)) {
    return null;
  }
  if (!isString(value.executiveSummary)) {
    return null;
  }

  const insights = value.insights
    .map(parseInsight)
    .filter((item): item is AIInsight => item !== null);
  const recommendations = value.recommendations
    .map(parseRecommendation)
    .filter((item): item is OptimizationRecommendation => item !== null);

  if (insights.length === 0 || recommendations.length === 0) {
    return null;
  }

  return {
    insights,
    recommendations,
    executiveSummary: value.executiveSummary,
  };
}

export function extractJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]) as unknown;
    } catch {
      return null;
    }
  }
}
