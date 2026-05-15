import {
  ANALYZE_MAX_TOKENS,
  CLAUDE_MODEL,
  QUERY_MAX_TOKENS,
} from "@/lib/ai/constants";
import { buildAnalyzeSystemPrompt, buildQuerySystemPrompt } from "@/lib/ai/prompts";
import { extractJsonFromText, parseAnalyzeResponse } from "@/lib/ai/validate";
import type {
  AnalyzeResponse,
  DashboardContext,
  QueryMessage,
} from "@/lib/types";

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  content: Array<{ type: string; text?: string }>;
}

function getApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY;
}

async function callClaude(
  system: string,
  messages: ClaudeMessage[],
  maxTokens: number,
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as ClaudeResponse;
  const text = data.content.find((block) => block.type === "text")?.text;
  if (!text) {
    throw new Error("Claude API returned no text content");
  }
  return text;
}

export function hasClaudeApiKey(): boolean {
  return Boolean(getApiKey());
}

export async function analyzeWithClaude(
  context: DashboardContext,
): Promise<AnalyzeResponse> {
  const system = buildAnalyzeSystemPrompt(context.period);
  const text = await callClaude(
    system,
    [
      {
        role: "user",
        content: `DashboardContext:\n${JSON.stringify(context, null, 2)}`,
      },
    ],
    ANALYZE_MAX_TOKENS,
  );

  const parsed = parseAnalyzeResponse(extractJsonFromText(text));
  if (!parsed) {
    throw new Error("Claude returned invalid analyze JSON");
  }
  return parsed;
}

export async function queryWithClaude(
  context: DashboardContext,
  question: string,
  historyPrefix: string,
): Promise<string> {
  const system = buildQuerySystemPrompt(context);
  const userContent = historyPrefix
    ? `${historyPrefix}User question: ${question}`
    : `User question: ${question}`;

  return callClaude(
    system,
    [{ role: "user", content: userContent }],
    QUERY_MAX_TOKENS,
  );
}

export function sanitizeQueryHistory(history: QueryMessage[]): QueryMessage[] {
  return history
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));
}
