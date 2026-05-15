// ─────────────────────────────────────────────────────────────
// adapters/openai.adapter.ts
// Converts raw OpenAI API usage records → UsageLog
//
// OpenAI raw format mirrors the real /v1/usage and
// /dashboard/billing/usage API response objects.
// ─────────────────────────────────────────────────────────────

import type { UsageLog, Team, Model, UsageType } from "@/lib/types"
import {
  inferComplexityScore,
  inferHoursSaved,
  inferTaskCounts,
  generateLogId,
} from "./shared"

// ─────────────────────────────────────────────────────────────
// Raw type — OpenAI usage export
// ─────────────────────────────────────────────────────────────

export interface OpenAIRawRecord {
  request_id: string
  created_at: string            // ISO 8601
  organization_id: string
  api_key_id: string
  api_key_name: string
  model: string                 // "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  finish_reason: "stop" | "length" | "content_filter" | "tool_calls" | "null"
  // Enriched fields
  user_display_name: string
  team_name: string
  purpose_tag: string
}

// ─────────────────────────────────────────────────────────────
// Model name mapping
// ─────────────────────────────────────────────────────────────

const OPENAI_MODEL_MAP: Record<string, Model> = {
  "gpt-4o":                "GPT-4o",
  "gpt-4o-2024-11-20":     "GPT-4o",
  "gpt-4o-mini":           "GPT-4o-mini",
  "gpt-4o-mini-2024-07-18":"GPT-4o-mini",
  "gpt-4":                 "GPT-4",
  "gpt-4-turbo":           "GPT-4",
  "gpt-4-turbo-2024-04-09":"GPT-4",
  "gpt-4.1":               "GPT-4o",
  "gpt-4.1-mini":          "GPT-4o-mini",
  "gpt-3.5-turbo":         "GPT-3.5",
  "gpt-3.5-turbo-0125":    "GPT-3.5",
  "o1":                    "GPT-4",    // o1 maps to high tier
  "o1-mini":               "GPT-4o",
  "o3-mini":               "GPT-4o",
}

// ─────────────────────────────────────────────────────────────
// Purpose tag → usageType
// ─────────────────────────────────────────────────────────────

const PURPOSE_USAGE_MAP: Record<string, UsageType> = {
  "code-generation":   "coding",
  "code-review":       "coding",
  "chat-support":      "support",
  "customer-support":  "support",
  "content-creation":  "content",
  "copywriting":       "content",
  "data-analysis":     "analysis",
  "research":          "research",
  "summarization":     "research",
  "automation":        "automation",
  "document-qa":       "research",
  "email-drafting":    "content",
}

// ─────────────────────────────────────────────────────────────
// Pricing (per 1K tokens, USD) — OpenAI public rates
// ─────────────────────────────────────────────────────────────

const INPUT_COST: Record<Model, number> = {
  "GPT-4":         0.03,
  "GPT-4o":        0.005,
  "GPT-4o-mini":   0.00015,
  "GPT-3.5":       0.0005,
  "Claude Opus":   0,
  "Claude Sonnet": 0,
  "Claude Haiku":  0,
  "Gemini Pro":    0,
  "Gemini Ultra":  0,
  "N/A":           0,
}

const OUTPUT_COST: Record<Model, number> = {
  "GPT-4":         0.06,
  "GPT-4o":        0.015,
  "GPT-4o-mini":   0.0006,
  "GPT-3.5":       0.0015,
  "Claude Opus":   0,
  "Claude Sonnet": 0,
  "Claude Haiku":  0,
  "Gemini Pro":    0,
  "Gemini Ultra":  0,
  "N/A":           0,
}

function calculateCost(model: Model, inputTokens: number, outputTokens: number): number {
  const cost = (inputTokens / 1000) * INPUT_COST[model]
             + (outputTokens / 1000) * OUTPUT_COST[model]
  return Math.round(cost * 100) / 100
}

// ─────────────────────────────────────────────────────────────
// Finish reason → success signal
// "length" = hit token limit = incomplete = failure
// ─────────────────────────────────────────────────────────────

function isSuccessfulRequest(finishReason: OpenAIRawRecord["finish_reason"]): boolean {
  return finishReason === "stop" || finishReason === "tool_calls"
}

// ─────────────────────────────────────────────────────────────
// Adapter
// ─────────────────────────────────────────────────────────────

export function adaptOpenAIRecord(raw: OpenAIRawRecord, index: number): UsageLog {
  const model        = OPENAI_MODEL_MAP[raw.model] ?? "GPT-4o"
  const usageType    = PURPOSE_USAGE_MAP[raw.purpose_tag] ?? "research"
  const inputTokens  = raw.prompt_tokens
  const outputTokens = raw.completion_tokens
  const success      = isSuccessfulRequest(raw.finish_reason)

  const { successfulTasks, totalTasks } = inferTaskCounts(1, usageType)

  return {
    id:                  generateLogId("openai", index),
    date:                raw.created_at,
    team:                raw.team_name as Team,
    user:                raw.user_display_name,
    tool:                "OpenAI API",
    model,
    platform:            `API (${raw.api_key_name})`,
    usageType,
    inputTokens,
    outputTokens,
    requests:            1,
    cost:                calculateCost(model, inputTokens, outputTokens),
    estimatedHoursSaved: inferHoursSaved(outputTokens, usageType),
    successfulTasks:     success ? successfulTasks : 0,
    totalTasks,
    complexityScore:     inferComplexityScore(model, usageType),
  }
}

export function adaptOpenAIRecords(records: OpenAIRawRecord[]): UsageLog[] {
  return records.map((r, i) => adaptOpenAIRecord(r, i))
}
