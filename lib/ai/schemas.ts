import { z } from "zod";

export const InsightSchema = z.object({
  id: z.string(),
  type: z.enum(["anomaly", "trend", "recommendation", "risk"]),
  severity: z.enum(["info", "warning", "critical"]),
  category: z
    .enum([
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
    ])
    .default("operational"),
  externalSourceIds: z.array(z.string()).default([]),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  title: z.string(),
  description: z.string(),
  whyThisMatters: z.string().default(""),
  affectedEntity: z.string(),
  estimatedSavings: z.number().optional(),
  confidence: z.number(),
  recommendedAction: z.string(),
});

export const RecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  evidence: z.string(),
  riskLevel: z.enum(["low", "medium", "high"]),
  confidence: z.number(),
  estimatedMonthlySavings: z.number(),
  category: z.enum([
    "model-switch",
    "seat-reduction",
    "workflow",
    "tool-consolidation",
  ]),
});

export const AnalyzeResponseSchema = z.object({
  insights: z.array(InsightSchema),
  recommendations: z.array(RecommendationSchema),
  executiveSummary: z.string(),
});