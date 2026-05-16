import { calculateRecommendationConfidence } from "./confidence";
import { HIGH_COMPLEXITY_MODELS } from "./constants";
import { calculateROI, roundMoney, roundPercent, roundScore } from "./math";
import type {
  Model,
  ModelMismatchSummary,
  OptimizationRecommendation,
  UsageLog,
  UsageType,
} from "@/lib/types";

const HOURS_SAVED_CAP_PER_LOG = 8;

/** Per-log score at or above this is treated as a mismatch. */
export const LOG_MISMATCH_SCORE_THRESHOLD = 0.45;

/** Aggregate gates for downgrade recommendations. */
export const MIN_PREMIUM_SPEND = 500;
export const MIN_MISMATCH_RATE = 0.25;
export const MIN_MISMATCHED_SPEND = 200;
export const MIN_ESTIMATED_SAVINGS = 50;
export const MAX_MODEL_MISMATCH_RECOMMENDATIONS = 5;

const SMALL_OUTPUT_TOKENS = 300;
const TINY_OUTPUT_TOKENS = 150;
const LOW_COMPLEXITY_THRESHOLD = 4;
const MID_COMPLEXITY_THRESHOLD = 6;
const MIN_MODEL_LOGS_FOR_BASELINES = 20;

interface ModelBaselines {
  complexityP25: number;
  outputTokensP25: number;
  roiP33: number;
  tokensPerRequestP25: number;
  successRateP33: number;
}

export interface ModelMismatchScoringContext {
  repetitiveIndex: Map<string, number>;
  baselinesByModel: Map<Model, ModelBaselines>;
}

const PREMIUM_DOWNGRADE_PATHS: Partial<Record<Model, Model>> = {
  "GPT-4": "GPT-4o-mini",
  "GPT-4o": "GPT-4o-mini",
  "Claude Opus": "Claude Sonnet",
  "Claude Sonnet": "Claude Haiku",
  "Gemini Ultra": "Gemini Pro",
};

const DOWNGRADE_SAVINGS_RATES: Partial<
  Record<Model, { min: number; max: number }>
> = {
  "GPT-4": { min: 0.25, max: 0.45 },
  "GPT-4o": { min: 0.2, max: 0.35 },
  "Claude Opus": { min: 0.2, max: 0.35 },
  "Claude Sonnet": { min: 0.15, max: 0.3 },
  "Gemini Ultra": { min: 0.2, max: 0.35 },
};

const ROUTINE_USAGE_TYPES: UsageType[] = ["support", "automation"];

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function cappedHours(log: UsageLog): number {
  return Math.min(log.estimatedHoursSaved, HOURS_SAVED_CAP_PER_LOG);
}

function isPremiumWithDowngrade(model: Model): boolean {
  return model in PREMIUM_DOWNGRADE_PATHS;
}

function successRate(log: UsageLog): number {
  if (log.totalTasks <= 0) {
    return 0;
  }
  return log.successfulTasks / log.totalTasks;
}

function tokensPerRequest(log: UsageLog): number {
  if (log.requests <= 0) {
    return log.outputTokens;
  }
  return log.outputTokens / log.requests;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) {
    return 0;
  }
  const index = Math.min(
    sorted.length - 1,
    Math.floor(sorted.length * p),
  );
  return sorted[index];
}

export function buildModelMismatchContext(
  logs: UsageLog[],
): ModelMismatchScoringContext {
  const baselinesByModel = new Map<Model, ModelBaselines>();

  for (const model of Object.keys(PREMIUM_DOWNGRADE_PATHS) as Model[]) {
    const modelLogs = logs.filter((log) => log.model === model);
    if (modelLogs.length < MIN_MODEL_LOGS_FOR_BASELINES) {
      continue;
    }

    baselinesByModel.set(model, {
      complexityP25: percentile(
        modelLogs.map((log) => log.complexityScore).sort((a, b) => a - b),
        0.25,
      ),
      outputTokensP25: percentile(
        modelLogs.map((log) => log.outputTokens).sort((a, b) => a - b),
        0.25,
      ),
      roiP33: percentile(
        modelLogs
          .map((log) => calculateROI(cappedHours(log), log.cost))
          .sort((a, b) => a - b),
        0.33,
      ),
      tokensPerRequestP25: percentile(
        modelLogs.map((log) => tokensPerRequest(log)).sort((a, b) => a - b),
        0.25,
      ),
      successRateP33: percentile(
        modelLogs.map((log) => successRate(log)).sort((a, b) => a - b),
        0.33,
      ),
    });
  }

  const repetitiveIndex = new Map<string, number>();
  for (const log of logs) {
    if (!isPremiumWithDowngrade(log.model)) {
      continue;
    }

    const baselines = baselinesByModel.get(log.model);
    const lowOutput = baselines
      ? log.outputTokens <= baselines.outputTokensP25
      : log.outputTokens < SMALL_OUTPUT_TOKENS;
    const lowComplexity = baselines
      ? log.complexityScore <= baselines.complexityP25
      : log.complexityScore < MID_COMPLEXITY_THRESHOLD;

    if (!lowOutput && !lowComplexity) {
      continue;
    }

    const key = `${log.user}|${log.usageType}|${log.model}`;
    repetitiveIndex.set(key, (repetitiveIndex.get(key) ?? 0) + 1);
  }

  return { repetitiveIndex, baselinesByModel };
}

/**
 * Deterministic per-log mismatch score in [0, 1] from telemetry signals.
 */
export function calculateLogMismatchScore(
  log: UsageLog,
  context: ModelMismatchScoringContext,
): number {
  if (!isPremiumWithDowngrade(log.model)) {
    return 0;
  }

  const baselines = context.baselinesByModel.get(log.model);
  if (!baselines) {
    return 0;
  }

  let score = 0;
  const roi = calculateROI(cappedHours(log), log.cost);
  const taskSuccess = successRate(log);
  const tpr = tokensPerRequest(log);

  if (log.complexityScore <= baselines.complexityP25) {
    score += 0.22;
  }
  if (log.outputTokens <= baselines.outputTokensP25) {
    score += 0.18;
  }
  if (roi <= baselines.roiP33) {
    score += 0.2;
  }
  if (taskSuccess <= baselines.successRateP33) {
    score += 0.08;
  }
  if (log.requests >= 2 && tpr <= baselines.tokensPerRequestP25) {
    score += 0.12;
  }

  if (log.complexityScore < LOW_COMPLEXITY_THRESHOLD) {
    score += 0.12;
  }
  if (log.outputTokens < TINY_OUTPUT_TOKENS) {
    score += 0.1;
  }
  if (roi < 50) {
    score += 0.1;
  }

  if (
    ROUTINE_USAGE_TYPES.includes(log.usageType) &&
    HIGH_COMPLEXITY_MODELS.includes(log.model)
  ) {
    score += 0.14;
  } else if (
    ROUTINE_USAGE_TYPES.includes(log.usageType) &&
    (log.model === "Claude Sonnet" || log.model === "GPT-4o")
  ) {
    score += 0.08;
  }

  if (log.requests >= 5 && tpr < 50) {
    score += 0.1;
  }

  const repetitiveKey = `${log.user}|${log.usageType}|${log.model}`;
  const repetitiveCount = context.repetitiveIndex.get(repetitiveKey) ?? 0;
  if (repetitiveCount >= 5) {
    score += 0.1;
  } else if (repetitiveCount >= 3) {
    score += 0.05;
  }

  return roundScore(clamp01(score));
}

export function isLogModelMismatch(
  log: UsageLog,
  context: ModelMismatchScoringContext,
): boolean {
  return (
    calculateLogMismatchScore(log, context) >= LOG_MISMATCH_SCORE_THRESHOLD
  );
}

/**
 * Aggregate mismatch rate for premium logs (replaces simplistic complexity-only check).
 */
export function getModelMismatchRate(logs: UsageLog[]): number {
  const premiumLogs = logs.filter((log) => isPremiumWithDowngrade(log.model));
  if (premiumLogs.length === 0) {
    return 0;
  }

  const context = buildModelMismatchContext(logs);
  const mismatched = premiumLogs.filter((log) =>
    isLogModelMismatch(log, context),
  ).length;

  return roundPercent((mismatched / premiumLogs.length) * 100) / 100;
}

function estimateDowngradeSavings(
  model: Model,
  mismatchRate: number,
  mismatchedSpend: number,
): number {
  const rates = DOWNGRADE_SAVINGS_RATES[model];
  if (!rates) {
    return 0;
  }

  const normalizedRate = Math.max(
    0,
    Math.min(1, (mismatchRate - MIN_MISMATCH_RATE) / (1 - MIN_MISMATCH_RATE)),
  );
  const savingsRate =
    rates.min + normalizedRate * (rates.max - rates.min);

  return roundMoney(mismatchedSpend * savingsRate);
}

function roiSupportsDowngrade(
  modelLogs: UsageLog[],
  mismatchedLogs: UsageLog[],
  mismatchRate: number,
): boolean {
  if (mismatchRate >= 0.28) {
    return true;
  }

  if (mismatchedLogs.length === 0) {
    return false;
  }

  const modelAvgRoi =
    modelLogs.reduce(
      (sum, log) => sum + calculateROI(cappedHours(log), log.cost),
      0,
    ) / modelLogs.length;
  const mismatchedAvgRoi =
    mismatchedLogs.reduce(
      (sum, log) => sum + calculateROI(cappedHours(log), log.cost),
      0,
    ) / mismatchedLogs.length;

  return mismatchedAvgRoi < modelAvgRoi * 0.9;
}

function getDominantUsageType(
  logs: UsageLog[],
): UsageType | undefined {
  const counts = new Map<UsageType, number>();
  for (const log of logs) {
    counts.set(log.usageType, (counts.get(log.usageType) ?? 0) + 1);
  }

  let top: UsageType | undefined;
  let topCount = 0;
  for (const [usageType, count] of counts) {
    if (count > topCount) {
      top = usageType;
      topCount = count;
    }
  }
  return top;
}

function buildMismatchEvidence(
  summary: Omit<ModelMismatchSummary, "evidence">,
): string {
  const mismatchPct = roundPercent(summary.mismatchRate * 100);
  const parts = [
    `${mismatchPct}% of ${summary.model} calls (${summary.mismatchedLogCount} of ${summary.logCount}) show premium misuse signals`,
    `avg complexity ${summary.avgComplexity}`,
    `ROI ${summary.avgMismatchedRoi}% on mismatched spend`,
    `$${summary.mismatchedSpend.toLocaleString()} in affected premium spend`,
  ];

  if (summary.dominantUsageType) {
    parts.push(`concentrated in ${summary.dominantUsageType} workflows`);
  }

  if (summary.smallOutputRate > 0) {
    parts.push(
      `${roundPercent(summary.smallOutputRate * 100)}% with outputs under ${SMALL_OUTPUT_TOKENS} tokens`,
    );
  }

  return `${parts.join(", ")}.`;
}

function usageTypeLabel(usageType: UsageType): string {
  const labels: Record<UsageType, string> = {
    coding: "coding",
    research: "research",
    content: "content generation",
    support: "support",
    automation: "automation",
    analysis: "data analysis",
  };
  return labels[usageType];
}

/**
 * Detect premium model misuse segments from usage telemetry.
 */
export function detectModelMismatches(
  logs: UsageLog[],
): ModelMismatchSummary[] {
  const context = buildModelMismatchContext(logs);
  const summaries: ModelMismatchSummary[] = [];

  for (const model of Object.keys(PREMIUM_DOWNGRADE_PATHS) as Model[]) {
    const recommendedModel = PREMIUM_DOWNGRADE_PATHS[model];
    if (!recommendedModel) {
      continue;
    }

    const modelLogs = logs.filter((log) => log.model === model);
    if (modelLogs.length === 0) {
      continue;
    }

    const affectedSpend = roundMoney(
      modelLogs.reduce((sum, log) => sum + log.cost, 0),
    );
    if (affectedSpend < MIN_PREMIUM_SPEND) {
      continue;
    }

    const mismatchedLogs = modelLogs.filter((log) =>
      isLogModelMismatch(log, context),
    );
    const mismatchRate = mismatchedLogs.length / modelLogs.length;
    if (mismatchRate < MIN_MISMATCH_RATE) {
      continue;
    }

    const mismatchedSpend = roundMoney(
      mismatchedLogs.reduce((sum, log) => sum + log.cost, 0),
    );
    if (mismatchedSpend < MIN_MISMATCHED_SPEND) {
      continue;
    }

    const mismatchScore =
      mismatchedLogs.length === 0
        ? 0
        : roundScore(
            mismatchedLogs.reduce(
              (sum, log) => sum + calculateLogMismatchScore(log, context),
              0,
            ) / mismatchedLogs.length,
          );

    const avgMismatchedRoi =
      mismatchedLogs.length === 0
        ? 0
        : roundPercent(
            mismatchedLogs.reduce(
              (sum, log) =>
                sum + calculateROI(cappedHours(log), log.cost),
              0,
            ) / mismatchedLogs.length,
          );

    if (!roiSupportsDowngrade(modelLogs, mismatchedLogs, mismatchRate)) {
      continue;
    }

    const estimatedSavings = estimateDowngradeSavings(
      model,
      mismatchRate,
      mismatchedSpend,
    );
    if (estimatedSavings < MIN_ESTIMATED_SAVINGS) {
      continue;
    }

    const avgComplexity =
      mismatchedLogs.length === 0
        ? 0
        : roundScore(
            mismatchedLogs.reduce(
              (sum, log) => sum + log.complexityScore,
              0,
            ) / mismatchedLogs.length,
          );

    const smallOutputRate =
      mismatchedLogs.length === 0
        ? 0
        : mismatchedLogs.filter(
            (log) => log.outputTokens < SMALL_OUTPUT_TOKENS,
          ).length / mismatchedLogs.length;

    const dominantUsageType = getDominantUsageType(mismatchedLogs);

    const base = {
      model,
      recommendedModel,
      mismatchRate: roundScore(mismatchRate),
      mismatchScore,
      affectedSpend,
      mismatchedSpend,
      estimatedSavings,
      logCount: modelLogs.length,
      mismatchedLogCount: mismatchedLogs.length,
      avgMismatchedRoi,
      avgComplexity,
      smallOutputRate: roundScore(smallOutputRate),
      dominantUsageType,
    };

    summaries.push({
      ...base,
      evidence: buildMismatchEvidence(base),
    });
  }

  return summaries.sort(
    (a, b) => b.estimatedSavings - a.estimatedSavings,
  );
}

function mismatchRecommendationId(
  model: Model,
  usageType?: UsageType,
): string {
  const slug = model.toLowerCase().replace(/\s+/g, "-");
  if (usageType) {
    return `rec-model-mismatch-${slug}-${usageType}`;
  }
  return `rec-model-mismatch-${slug}`;
}

function buildTitle(summary: ModelMismatchSummary): string {
  const target = summary.recommendedModel;
  const usage = summary.dominantUsageType
    ? usageTypeLabel(summary.dominantUsageType)
    : "low-complexity";

  if (
    summary.dominantUsageType &&
    ROUTINE_USAGE_TYPES.includes(summary.dominantUsageType)
  ) {
    return `Downgrade ${summary.model} used for repetitive ${usage} tasks`;
  }

  return `Route ${usage} ${summary.model} usage to ${target}`;
}

function buildDescription(summary: ModelMismatchSummary): string {
  const usage = summary.dominantUsageType
    ? `${usageTypeLabel(summary.dominantUsageType)} workflows`
    : "low-complexity requests";

  return (
    `Shift ${summary.model} calls in ${usage} to ${summary.recommendedModel} ` +
    `where complexity, output size, and ROI indicate premium model overspend.`
  );
}

/**
 * Generate downgrade recommendations for detected premium misuse.
 */
export function generateModelMismatchRecommendations(
  summaries: ModelMismatchSummary[],
): OptimizationRecommendation[] {
  return summaries
    .slice(0, MAX_MODEL_MISMATCH_RECOMMENDATIONS)
    .map((summary) => {
      const mismatchPct = roundPercent(summary.mismatchRate * 100);

      return {
        id: mismatchRecommendationId(
          summary.model,
          summary.dominantUsageType,
        ),
        title: buildTitle(summary),
        description: buildDescription(summary),
        evidence: summary.evidence,
        riskLevel: "medium" as const,
        confidence: calculateRecommendationConfidence({
          sampleSize: summary.mismatchedLogCount,
          signalStrength: summary.mismatchScore,
          consistency: summary.mismatchRate,
          severity: Math.min(
            1,
            summary.mismatchedSpend / Math.max(summary.affectedSpend, 1),
          ),
        }),
        estimatedMonthlySavings: summary.estimatedSavings,
        category: "model-switch" as const,
        i18nParams: {
          model: summary.model,
          recommendedModel: summary.recommendedModel,
          mismatch: mismatchPct,
          mismatchedSpend: summary.mismatchedSpend,
          avgRoi: summary.avgMismatchedRoi,
        },
      };
    });
}
