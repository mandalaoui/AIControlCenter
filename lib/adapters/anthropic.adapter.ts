// ─────────────────────────────────────────────────────────────
// adapters/anthropic.adapter.ts
// Converts raw Anthropic API usage records → UsageLog
//
// Anthropic raw format mirrors the real /v1/usage endpoint
// and message response objects (workbench + API exports).
// ─────────────────────────────────────────────────────────────

import type { UsageLog, Team, Model, UsageType } from "@/lib/types"
import {
  inferComplexityScore,
  inferHoursSaved,
  inferTaskCounts,
  generateLogId,
} from "./shared"

// ─────────────────────────────────────────────────────────────
// Raw type — what Anthropic API usage export looks like
// ─────────────────────────────────────────────────────────────

export interface AnthropicRawRecord {
  request_id: string
  created_at: string            // ISO 8601
  workspace_id: string
  api_key_name: string          // used to infer team
  model: string                 // "claude-opus-4-20250514", "claude-sonnet-4-20250514"
  input_tokens: number
  output_tokens: number
  cache_read_input_tokens: number
  cache_creation_input_tokens: number
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence" | "tool_use"
  // Enriched fields (added by org's logging layer, not native to Anthropic)
  user_display_name: string
  team_name: string
  purpose_tag: string           // "code-review", "doc-generation", "support-bot"
}

// ─────────────────────────────────────────────────────────────
// Model name mapping — Anthropic model strings → our Model type
// ─────────────────────────────────────────────────────────────

const ANTHROPIC_MODEL_MAP: Record<string, Model> = {
  "claude-opus-4-20250514":    "Claude Opus",
  "claude-opus-4":             "Claude Opus",
  "claude-sonnet-4-20250514":  "Claude Sonnet",
  "claude-sonnet-4":           "Claude Sonnet",
  "claude-haiku-4-5-20251001": "Claude Haiku",
  "claude-haiku-4":            "Claude Haiku",
  "claude-3-opus-20240229":    "Claude Opus",
  "claude-3-5-sonnet-20241022":"Claude Sonnet",
  "claude-3-haiku-20240307":   "Claude Haiku",
}

// ─────────────────────────────────────────────────────────────
// Purpose tag → usageType
// ─────────────────────────────────────────────────────────────

const PURPOSE_USAGE_MAP: Record<string, UsageType> = {
  "code-review":       "coding",
  "code-generation":   "coding",
  "doc-generation":    "content",
  "research":          "research",
  "support-bot":       "support",
  "data-analysis":     "analysis",
  "automation":        "automation",
  "summarization":     "research",
  "email-drafting":    "content",
  "report-writing":    "content",
}

// ─────────────────────────────────────────────────────────────
// Pricing (per 1K tokens, USD) — Anthropic public rates
// ─────────────────────────────────────────────────────────────

const INPUT_COST: Record<Model, number> = {
  "Claude Opus":   0.015,
  "Claude Sonnet": 0.003,
  "Claude Haiku":  0.00025,
  "GPT-4":         0,
  "GPT-4o":        0,
  "GPT-4o-mini":   0,
  "GPT-3.5":       0,
  "Gemini Pro":    0,
  "Gemini Ultra":  0,
  "N/A":           0,
}

const OUTPUT_COST: Record<Model, number> = {
  "Claude Opus":   0.075,
  "Claude Sonnet": 0.015,
  "Claude Haiku":  0.00125,
  "GPT-4":         0,
  "GPT-4o":        0,
  "GPT-4o-mini":   0,
  "GPT-3.5":       0,
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
// Stop reason → success signal
// max_tokens = incomplete = not a successful task
// ─────────────────────────────────────────────────────────────

function isSuccessfulRequest(stopReason: AnthropicRawRecord["stop_reason"]): boolean {
  return stopReason === "end_turn" || stopReason === "tool_use"
}

// ─────────────────────────────────────────────────────────────
// Adapter
// ─────────────────────────────────────────────────────────────

export function adaptAnthropicRecord(raw: AnthropicRawRecord, index: number): UsageLog {
  const model        = ANTHROPIC_MODEL_MAP[raw.model] ?? "Claude Sonnet"
  const usageType    = PURPOSE_USAGE_MAP[raw.purpose_tag] ?? "research"
  const inputTokens  = raw.input_tokens + raw.cache_read_input_tokens
  const outputTokens = raw.output_tokens
  const success      = isSuccessfulRequest(raw.stop_reason)

  const { successfulTasks, totalTasks } = inferTaskCounts(1, usageType)

  return {
    id:                  generateLogId("anthropic", index),
    date:                raw.created_at,
    team:                raw.team_name as Team,
    user:                raw.user_display_name,
    tool:                "Anthropic API",
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

export function adaptAnthropicRecords(records: AnthropicRawRecord[]): UsageLog[] {
  return records.map((r, i) => adaptAnthropicRecord(r, i))
}
