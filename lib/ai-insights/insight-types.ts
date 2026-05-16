import type {
  AIInsight,
  AIInsightCategory,
  AIInsightPriority,
  AIInsightSeverity,
  AIInsightType,
  AnalyzeResponse,
  DashboardContext,
} from "@/lib/types";

export type {
  AIInsight,
  AIInsightCategory,
  AIInsightPriority,
  AIInsightSeverity,
  AIInsightType,
  AnalyzeResponse,
  DashboardContext,
};

/** Raw signal before synthesis — internal to the insights layer. */
export interface InsightSignal {
  id: string;
  source: "anomaly" | "team" | "tool" | "model" | "productivity" | "pattern";
  entity: string;
  category: AIInsightCategory;
  severity: AIInsightSeverity;
  type: AIInsightType;
  headline: string;
  detail: string;
  confidence: number;
  estimatedSavings?: number;
}

/** Organizational pattern detected across multiple signals. */
export interface OrganizationalPattern {
  id: string;
  category: AIInsightCategory;
  narrative: string;
  whyThisMatters: string;
  affectedEntities: string[];
  severity: AIInsightSeverity;
  confidence: number;
  estimatedSavings?: number;
}

import type { ExternalInsightContext } from "@/lib/ai-insights/external-context";

export interface EnrichInsightsOptions {
  /** When true, merge closely related signals into fewer strategic narratives. */
  synthesize?: boolean;
  /** Verified AI news / market signals for grounded external intelligence. */
  external?: ExternalInsightContext;
}
