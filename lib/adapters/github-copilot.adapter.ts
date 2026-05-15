// ─────────────────────────────────────────────────────────────
// adapters/github-copilot.adapter.ts
// Converts raw GitHub Copilot usage records → UsageLog
//
// GitHub Copilot raw format mirrors the real
// GET /orgs/{org}/copilot/usage API response.
// Note: Copilot is seat-based, not token-based.
// Token counts are inferred from active time + suggestion counts.
// ─────────────────────────────────────────────────────────────

import type { UsageLog, Team, Model } from "@/lib/types"
import {
  inferComplexityScore,
  inferHoursSaved,
  inferTaskCounts,
  generateLogId,
} from "./shared"

// ─────────────────────────────────────────────────────────────
// Raw type — GitHub Copilot org usage export
// ─────────────────────────────────────────────────────────────

export interface GitHubCopilotRawRecord {
  day: string                       // "2026-05-01"
  user_login: string
  user_display_name: string
  team_name: string
  editor: "vscode" | "jetbrains" | "neovim" | "github.com"
  model_version: string             // "gpt-4o", "claude-sonnet", "default"
  // Suggestion metrics
  suggestions_count: number
  acceptances_count: number
  lines_suggested: number
  lines_accepted: number
  // Chat metrics (Copilot Chat)
  chat_turns: number
  chat_acceptances: number
  // Active time
  active_time_seconds: number
  // Seat info
  seat_type: "business" | "enterprise"
  seat_active: boolean
}

// ─────────────────────────────────────────────────────────────
// Model mapping — Copilot model version strings → our Model type
// ─────────────────────────────────────────────────────────────

const COPILOT_MODEL_MAP: Record<string, Model> = {
  "gpt-4o":          "GPT-4o",
  "gpt-4":           "GPT-4",
  "gpt-4o-mini":     "GPT-4o-mini",
  "claude-sonnet":   "Claude Sonnet",
  "claude-haiku":    "Claude Haiku",
  "default":         "GPT-4o",      // Copilot default = GPT-4o tier
  "base":            "GPT-3.5",
}

// ─────────────────────────────────────────────────────────────
// Token inference
// Copilot doesn't expose token counts — we infer from lines + chat
// ~15 tokens per line of code (rough average, both directions)
// ~50 tokens per chat turn (short exchanges)
// ─────────────────────────────────────────────────────────────

const TOKENS_PER_LINE    = 15
const TOKENS_PER_CHAT    = 50
const INPUT_OUTPUT_RATIO = 0.6   // input ≈ 60% of total in code completion

function inferTokens(raw: GitHubCopilotRawRecord): {
  inputTokens: number
  outputTokens: number
} {
  const completionTokens = raw.lines_suggested * TOKENS_PER_LINE
  const chatTokens       = raw.chat_turns * TOKENS_PER_CHAT
  const totalTokens      = completionTokens + chatTokens

  return {
    inputTokens:  Math.round(totalTokens * INPUT_OUTPUT_RATIO),
    outputTokens: Math.round(totalTokens * (1 - INPUT_OUTPUT_RATIO)),
  }
}

// ─────────────────────────────────────────────────────────────
// Cost calculation
// Copilot Business = $19/seat/month
// We allocate daily cost = $19 / 30 per active day
// Then scale by activity ratio vs avg daily usage
// ─────────────────────────────────────────────────────────────

const COPILOT_MONTHLY_SEAT_COST = 19
const DAILY_SEAT_COST = COPILOT_MONTHLY_SEAT_COST / 30

function calculateCost(raw: GitHubCopilotRawRecord): number {
  if (!raw.seat_active) return 0
  // Scale daily cost by how active the user was (vs 4h baseline)
  const activityRatio = Math.min(1, raw.active_time_seconds / (4 * 3600))
  const cost = DAILY_SEAT_COST * (0.5 + activityRatio * 0.5)  // min 50% of daily cost
  return Math.round(cost * 100) / 100
}

// ─────────────────────────────────────────────────────────────
// Acceptance rate → task success proxy
// High acceptance = productive session
// ─────────────────────────────────────────────────────────────

function inferCopilotTaskCounts(raw: GitHubCopilotRawRecord): {
  successfulTasks: number
  totalTasks: number
} {
  const totalTasks = raw.suggestions_count + raw.chat_turns
  if (totalTasks === 0) return { successfulTasks: 0, totalTasks: 1 }

  const acceptedSuggestions = raw.acceptances_count
  const acceptedChat        = raw.chat_acceptances
  const successfulTasks     = acceptedSuggestions + acceptedChat

  return {
    totalTasks:      Math.max(1, totalTasks),
    successfulTasks: Math.max(0, successfulTasks),
  }
}

// ─────────────────────────────────────────────────────────────
// Adapter
// ─────────────────────────────────────────────────────────────

export function adaptGitHubCopilotRecord(
  raw: GitHubCopilotRawRecord,
  index: number
): UsageLog {
  const model                        = COPILOT_MODEL_MAP[raw.model_version] ?? "GPT-4o"
  const usageType                    = raw.chat_turns > raw.suggestions_count ? "research" : "coding"
  const { inputTokens, outputTokens} = inferTokens(raw)
  const { successfulTasks, totalTasks } = inferCopilotTaskCounts(raw)

  return {
    id:                  generateLogId("copilot", index),
    date:                `${raw.day}T09:00:00Z`,
    team:                raw.team_name as Team,
    user:                raw.user_display_name,
    tool:                "GitHub Copilot",
    model,
    platform:            `Copilot (${raw.editor})`,
    usageType,
    inputTokens,
    outputTokens,
    requests:            raw.suggestions_count + raw.chat_turns,
    cost:                calculateCost(raw),
    estimatedHoursSaved: inferHoursSaved(outputTokens, usageType),
    successfulTasks,
    totalTasks,
    complexityScore:     inferComplexityScore(model, usageType),
  }
}

export function adaptGitHubCopilotRecords(records: GitHubCopilotRawRecord[]): UsageLog[] {
  return records.map((r, i) => adaptGitHubCopilotRecord(r, i))
}
