import type {
  AIInsight,
  AIInsightCategory,
  AIInsightType,
  AnomalySummary,
} from "@/lib/types";

export const INSIGHT_CATEGORIES = [
  "strategic",
  "financial",
  "operational",
  "adoption",
  "market",
  "efficiency",
  "risk",
  "governance",
  "market-change",
  "pricing-shift",
  "strategic-opportunity",
  "vendor-risk",
] as const satisfies readonly AIInsightCategory[];

export const MARKET_INSIGHT_CATEGORIES = [
  "market-change",
  "pricing-shift",
  "strategic-opportunity",
  "vendor-risk",
] as const satisfies readonly AIInsightCategory[];

const TYPE_DEFAULT_CATEGORY: Record<AIInsightType, AIInsightCategory> = {
  anomaly: "operational",
  trend: "strategic",
  recommendation: "efficiency",
  risk: "risk",
};

const CATEGORY_KEYWORDS: Record<AIInsightCategory, string[]> = {
  strategic: ["strategy", "direction", "portfolio", "roadmap", "alignment"],
  financial: ["spend", "cost", "budget", "savings", "roi", "waste"],
  operational: ["workflow", "utilization", "seat", "anomaly", "spike"],
  adoption: ["adoption", "active users", "usage growth", "dependency"],
  market: ["vendor", "benchmark", "industry", "market"],
  efficiency: ["efficiency", "model", "routing", "optimization", "overlap"],
  risk: ["risk", "compliance", "governance", "exposure", "dependency"],
  governance: ["policy", "governance", "audit", "controls", "standard"],
  "market-change": [
    "market shift",
    "industry trend",
    "consolidat",
    "ecosystem",
    "platform shift",
  ],
  "pricing-shift": ["pricing", "licensing", "token price", "cost per", "repricing"],
  "strategic-opportunity": [
    "opportunity",
    "alternative",
    "may offer",
    "could shift",
    "price/performance",
  ],
  "vendor-risk": ["vendor risk", "lock-in", "dependency", "scrutiny", "governance pressure"],
};

export function isInsightCategory(value: string): value is AIInsightCategory {
  return (INSIGHT_CATEGORIES as readonly string[]).includes(value);
}

export function inferCategoryFromInsight(insight: Pick<
  AIInsight,
  "type" | "title" | "description" | "category"
>): AIInsightCategory {
  if (insight.category && isInsightCategory(insight.category)) {
    return insight.category;
  }

  const text = `${insight.title} ${insight.description}`.toLowerCase();
  for (const category of INSIGHT_CATEGORIES) {
    if (CATEGORY_KEYWORDS[category].some((kw) => text.includes(kw))) {
      return category;
    }
  }

  return TYPE_DEFAULT_CATEGORY[insight.type];
}

export function inferCategoryFromAnomaly(anomaly: AnomalySummary): AIInsightCategory {
  const text = `${anomaly.description} ${anomaly.magnitude}`.toLowerCase();
  if (text.includes("spend") || text.includes("cost")) return "financial";
  if (text.includes("seat") || text.includes("utilization")) return "operational";
  if (text.includes("roi")) return "efficiency";
  return "operational";
}

export function assignCategory(insight: AIInsight): AIInsight {
  return {
    ...insight,
    category: inferCategoryFromInsight(insight),
  };
}
