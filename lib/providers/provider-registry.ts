import type { UsageLog } from "@/lib/types";

import {
  adaptOpenAIRecords,
  adaptAnthropicRecords,
  adaptGitHubCopilotRecords,
  adaptCursorRecords,
} from "@/lib/adapters";

import type { OpenAIRawRecord } from "@/lib/adapters/openai.adapter";
import type { AnthropicRawRecord } from "@/lib/adapters/anthropic.adapter";
import type { GitHubCopilotRawRecord } from "@/lib/adapters/github-copilot.adapter";
import type { CursorRawRecord } from "@/lib/adapters/cursor.adapter";

export interface TelemetryProvider<TRawRecord = unknown> {
  id: string;
  displayName: string;
  loader: () => Promise<TRawRecord[]>;
  adapter: (raw: unknown[]) => UsageLog[];
}

// Type-safe factory to prevent adapter/loader mismatch
function createProvider<TRawRecord>(
  config: Omit<TelemetryProvider<TRawRecord>, "adapter"> & {
    adapter: (raw: TRawRecord[]) => UsageLog[];
  }
): TelemetryProvider<TRawRecord> {
  return {
    ...config,
    // Adapter cast is safe because loader guarantees TRawRecord[]
    adapter: (raw: unknown[]) => config.adapter(raw as TRawRecord[]),
  };
}

export const PROVIDERS: TelemetryProvider[] = [
  createProvider<OpenAIRawRecord>({
    id: "openai",
    displayName: "OpenAI",
    loader: async () => {
      const module = await import("@/data/raw/openai.raw.json");
      return module.default as OpenAIRawRecord[];
    },
    adapter: adaptOpenAIRecords,
  }),

  createProvider<AnthropicRawRecord>({
    id: "anthropic",
    displayName: "Anthropic",
    loader: async () => {
      const module = await import("@/data/raw/anthropic.raw.json");
      return module.default as AnthropicRawRecord[];
    },
    adapter: adaptAnthropicRecords,
  }),

  createProvider<GitHubCopilotRawRecord>({
    id: "github-copilot",
    displayName: "GitHub Copilot",
    loader: async () => {
      const module = await import("@/data/raw/github-copilot.raw.json");
      return module.default as GitHubCopilotRawRecord[];
    },
    adapter: adaptGitHubCopilotRecords,
  }),

  createProvider<CursorRawRecord>({
    id: "cursor",
    displayName: "Cursor",
    loader: async () => {
      const module = await import("@/data/raw/cursor.raw.json");
      return module.default as CursorRawRecord[];
    },
    adapter: adaptCursorRecords,
  }),
];