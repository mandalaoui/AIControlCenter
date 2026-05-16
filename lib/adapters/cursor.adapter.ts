// ─────────────────────────────────────────────────────────────
// adapters/cursor.adapter.ts
// Converts raw Cursor usage records → UsageLog
//
// Cursor raw format reflects their real export structure:
// per-session records with editor activity, model used,
// and token counts for completions + chat.
// ─────────────────────────────────────────────────────────────

import type { UsageLog, Team, Model } from "@/lib/types"
import {
  inferComplexityScore,
  inferHoursSaved,
  inferTaskCounts,
  generateLogId,
} from "./shared"
import { calculateCost } from "@/lib/pricing";

// ─────────────────────────────────────────────────────────────
// Raw type — what Cursor exports
// ─────────────────────────────────────────────────────────────

export interface CursorRawRecord {
  session_id: string
  timestamp: string             // ISO 8601
  user_email: string
  user_display_name: string
  team_name: string
  model: string                 // "claude-sonnet-4", "gpt-4o", "cursor-fast"
  feature: "completion" | "chat" | "cmd-k" | "agent"
  completion_tokens: number
  prompt_tokens: number
  accepted_completions: number
  total_completions: number
  active_duration_seconds: number
  seat_type: "pro" | "business"
}

// ─────────────────────────────────────────────────────────────
// Model name mapping — Cursor names → our Model type
// ─────────────────────────────────────────────────────────────

const CURSOR_MODEL_MAP: Record<string, Model> = {
  "claude-opus-4":      "Claude Opus",
  "claude-sonnet-4":    "Claude Sonnet",
  "claude-haiku-4":     "Claude Haiku",
  "gpt-4o":             "GPT-4o",
  "gpt-4":              "GPT-4",
  "gpt-4o-mini":        "GPT-4o-mini",
  "cursor-fast":        "GPT-4o-mini",   // Cursor's fast model maps to mini tier
  "cursor-slow":        "GPT-4o",
  "gemini-pro":         "Gemini Pro",
}

// ─────────────────────────────────────────────────────────────
// Feature → usageType mapping
// ─────────────────────────────────────────────────────────────

const FEATURE_USAGE_TYPE = {
  completion: "coding",
  "cmd-k":    "coding",
  chat:       "research",
  agent:      "automation",
} as const

// ─────────────────────────────────────────────────────────────
// Adapter
// ─────────────────────────────────────────────────────────────

export function adaptCursorRecord(raw: CursorRawRecord): UsageLog {
  const model       = CURSOR_MODEL_MAP[raw.model] ?? "GPT-4o-mini"
  const usageType   = FEATURE_USAGE_TYPE[raw.feature] ?? "coding"
  const inputTokens = raw.prompt_tokens
  const outputTokens = raw.completion_tokens

  const { successfulTasks, totalTasks } = inferTaskCounts(raw.total_completions || 1, usageType)

  return {
    id:                  generateLogId("cursor", raw.session_id),
    date:                raw.timestamp,
    team:                raw.team_name as Team,
    user:                raw.user_display_name,
    tool:                "Cursor",
    model,
    platform:            "Cursor IDE",
    usageType,
    inputTokens,
    outputTokens,
    requests:            raw.total_completions || 1,
    cost:                calculateCost(model, inputTokens, outputTokens),
    estimatedHoursSaved: inferHoursSaved(outputTokens, usageType),
    successfulTasks,
    totalTasks,
    complexityScore:     inferComplexityScore(model, usageType, raw.session_id),
  }
}

export function adaptCursorRecords(records: CursorRawRecord[]): UsageLog[] {
  return records.map((r) => adaptCursorRecord(r))
}
