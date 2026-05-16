// ─────────────────────────────────────────────────────────────
// adapters/shared.ts
// Shared heuristics used by all vendor adapters.
// Never import from this file in components — adapters only.
// ─────────────────────────────────────────────────────────────

import type { Model, UsageType } from "@/lib/types"

// ─────────────────────────────────────────────────────────────
// Model tier → complexity score baseline
// High-tier model on a task = higher expected complexity
// ─────────────────────────────────────────────────────────────

const MODEL_COMPLEXITY_BASELINE: Record<Model, number> = {
  "Claude Opus":   8,
  "GPT-4":         8,
  "Gemini Ultra":  8,
  "Claude Sonnet": 5,
  "GPT-4o":        5,
  "Gemini Pro":    5,
  "Claude Haiku":  3,
  "GPT-4o-mini":   3,
  "GPT-3.5":       2,
  "N/A":           3,
}

/** Deterministic ±2 variance from a stable seed (record id). */
function deterministicVariance(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return (Math.abs(hash) % 400) / 100 - 2
}

/**
 * Infers complexityScore (1–10) from model tier + usageType.
 * Variance is deterministic per seed so telemetry generation is reproducible.
 */
export function inferComplexityScore(
  model: Model,
  usageType: UsageType,
  seed = "",
): number {
  const base = MODEL_COMPLEXITY_BASELINE[model]

  const usageModifier: Record<UsageType, number> = {
    automation: +1,
    research:   +1,
    analysis:   +1,
    coding:      0,
    content:    -1,
    support:    -2,
  }

  const variance = deterministicVariance(
    seed || `${model}-${usageType}`,
  )
  const raw = base + usageModifier[usageType] + variance
  return Math.min(10, Math.max(1, Math.round(raw)))
}

// ─────────────────────────────────────────────────────────────
// Hours saved heuristic
// Based on output tokens — more tokens = more work done for user
// ─────────────────────────────────────────────────────────────

/**
 * Estimates hours saved from output tokens.
 * Baseline: 1000 output tokens ≈ 0.5h saved for knowledge work.
 * usageType multiplier reflects how much time AI actually displaces.
 */
export function inferHoursSaved(outputTokens: number, usageType: UsageType): number {
  const BASE_HOURS_PER_1K_TOKENS = 0.08

  const multiplier: Record<UsageType, number> = {
    coding:     1.2,
    automation: 1.1,
    research:   0.9,
    analysis:   0.8,
    content:    0.6,
    support:    0.3,
  }

  const raw = (outputTokens / 1000) * BASE_HOURS_PER_1K_TOKENS * multiplier[usageType]
  return Math.round(raw * 10) / 10                   // 1 decimal place
}

// ─────────────────────────────────────────────────────────────
// Task success heuristic
// Inferred from output/input ratio — high ratio = productive session
// ─────────────────────────────────────────────────────────────

/**
 * Returns { successfulTasks, totalTasks } from request count.
 * Success rate varies by usageType.
 */
export function inferTaskCounts(
  requests: number,
  usageType: UsageType
): { successfulTasks: number; totalTasks: number } {
  const successRate: Record<UsageType, number> = {
    coding:     0.78,
    automation: 0.82,
    research:   0.88,
    analysis:   0.85,
    content:    0.90,
    support:    0.92,
  }

  const totalTasks = Math.max(1, requests)
  const successfulTasks = Math.min(
    totalTasks,
    Math.round(totalTasks * successRate[usageType]),
  )
  return { successfulTasks, totalTasks }
}

// ─────────────────────────────────────────────────────────────
// ID generator
// ─────────────────────────────────────────────────────────────

export function generateLogId(vendor: string, rawId: string): string {
  return `${vendor}_${rawId}`;
}
