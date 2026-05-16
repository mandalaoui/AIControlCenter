import {
  ANALYZE_MAX_TOKENS,
  CLAUDE_MODEL,
  QUERY_MAX_TOKENS,
} from "@/lib/ai/constants";

import {
  buildAnalyzeSystemPrompt,
  buildQuerySystemPrompt,
} from "@/lib/ai/prompts";

import { AnalyzeResponseSchema } from "@/lib/ai/schemas";

import type {
  AnalyzeResponse,
  DashboardContext,
  QueryMessage,
} from "@/lib/types";

import {
  generateObject,
  generateText,
} from "ai";

import { anthropic } from "@ai-sdk/anthropic";

// Checks whether the Anthropic API key exists.
export function hasClaudeApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Generates structured AI insights and recommendations from dashboard data.
export async function analyzeWithClaude(
  context: DashboardContext,
): Promise<AnalyzeResponse> {
  const system = buildAnalyzeSystemPrompt(context.period);

  const { object } = await generateObject({
    model: anthropic(CLAUDE_MODEL),
    schema: AnalyzeResponseSchema,
    system,
    prompt: `DashboardContext:\n${JSON.stringify(context, null, 2)}`,
    maxOutputTokens: ANALYZE_MAX_TOKENS,
  });

  return object;
}

// Answers natural-language questions about organizational AI usage.
export async function queryWithClaude(
  context: DashboardContext,
  question: string,
  historyPrefix: string,
): Promise<string> {
  const system = buildQuerySystemPrompt(context);

  const userContent = historyPrefix
    ? `${historyPrefix}User question: ${question}`
    : `User question: ${question}`;

  const { text } = await generateText({
    model: anthropic(CLAUDE_MODEL),
    system,
    prompt: userContent,
    maxOutputTokens: QUERY_MAX_TOKENS,
  });

  return text;
}

// Removes invalid or empty messages from query history.
export function sanitizeQueryHistory(
  history: QueryMessage[],
): QueryMessage[] {
  return history
    .filter(
      (message) =>
        (message.role === "user" ||
          message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim(),
    }));
}