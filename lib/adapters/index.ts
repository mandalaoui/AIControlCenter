// ─────────────────────────────────────────────────────────────
// adapters/index.ts
// Single entry point for all vendor adapters.
// Import everything from here — never from individual adapter files.
// ─────────────────────────────────────────────────────────────

export { adaptCursorRecord, adaptCursorRecords }       from "./cursor.adapter"
export { adaptAnthropicRecord, adaptAnthropicRecords } from "./anthropic.adapter"
export { adaptOpenAIRecord, adaptOpenAIRecords }       from "./openai.adapter"
export { adaptGitHubCopilotRecord, adaptGitHubCopilotRecords } from "./github-copilot.adapter"

export type { CursorRawRecord }       from "./cursor.adapter"
export type { AnthropicRawRecord }    from "./anthropic.adapter"
export type { OpenAIRawRecord }       from "./openai.adapter"
export type { GitHubCopilotRawRecord} from "./github-copilot.adapter"

// ─────────────────────────────────────────────────────────────
// Unified adapter — convert any vendor's raw records at once
// Usage:
//   import { adaptAll } from "@/lib/adapters"
//   const logs = adaptAll({ cursor: [...], openai: [...], ... })
// ─────────────────────────────────────────────────────────────

import { adaptCursorRecords }       from "./cursor.adapter"
import { adaptAnthropicRecords }    from "./anthropic.adapter"
import { adaptOpenAIRecords }       from "./openai.adapter"
import { adaptGitHubCopilotRecords} from "./github-copilot.adapter"

import type { UsageLog }              from "@/lib/types"
import type { CursorRawRecord }       from "./cursor.adapter"
import type { AnthropicRawRecord }    from "./anthropic.adapter"
import type { OpenAIRawRecord }       from "./openai.adapter"
import type { GitHubCopilotRawRecord} from "./github-copilot.adapter"

interface AdaptAllInput {
  cursor?:       CursorRawRecord[]
  anthropic?:    AnthropicRawRecord[]
  openai?:       OpenAIRawRecord[]
  githubCopilot?:GitHubCopilotRawRecord[]
}

/**
 * Adapts all vendor raw records into a unified UsageLog[].
 * Sorted by date ascending.
 */
export function adaptAll(input: AdaptAllInput): UsageLog[] {
  const logs: UsageLog[] = [
    ...adaptCursorRecords(input.cursor         ?? []),
    ...adaptAnthropicRecords(input.anthropic   ?? []),
    ...adaptOpenAIRecords(input.openai         ?? []),
    ...adaptGitHubCopilotRecords(input.githubCopilot ?? []),
  ]

  return logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}
