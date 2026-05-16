import {
  ANALYZE_MAX_TOKENS,
  QUERY_MAX_TOKENS,
} from "@/lib/ai/constants";
import {
  buildAnalyzeSystemPrompt,
  buildQuerySystemPrompt,
} from "@/lib/ai/prompts";
import { AnalyzeResponseSchema } from "@/lib/ai/schemas";
import type { DashboardContext, QueryMessage } from "@/lib/types";
import type { z } from "zod";

type LlmAnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;
import { generateObject, generateText } from "ai";
import { llmModel, llmKey } from "@/lib/ai/providers/llm-provider";

const VALID_TYPES = new Set(["anomaly", "trend", "recommendation", "risk"]);

// Checks whether the Anthropic API key exists.
export function hasLlmApiKey(): boolean {
  return Boolean(llmKey);
}

function normalizeRawResponse(parsed: unknown): unknown {
  if (!parsed || typeof parsed !== "object") return parsed;
  const obj = parsed as Record<string, unknown>;

  if (Array.isArray(obj.insights)) {
    obj.insights = obj.insights.map((insight: Record<string, unknown>) => ({
      ...insight,
      type: VALID_TYPES.has(insight.type as string) ? insight.type : "trend",
      estimatedSavings: typeof insight.estimatedSavings === "number" && insight.estimatedSavings > 0
        ? insight.estimatedSavings
        : undefined,
    }));
  }

  if (Array.isArray(obj.recommendations)) {
    obj.recommendations = obj.recommendations.filter(
      (r) => r !== null && typeof r === "object" && !Array.isArray(r),
    );
  }

  return obj;
}

// Generates structured AI insights and recommendations from dashboard data.
export async function analyzeWithLlm(
  context: DashboardContext,
  externalContextBlock = "",
): Promise<LlmAnalyzeResponse> {
  const system = buildAnalyzeSystemPrompt(context.period, externalContextBlock);

  const promptParts = [
    `DashboardContext:\n${JSON.stringify(context, null, 2)}`,
  ];
  if (externalContextBlock) {
    promptParts.push(`\n${externalContextBlock}`);
  }

  const { text } = await generateText({
    model: llmModel,
    system: system + "\n\nReturn ONLY valid JSON matching this exact structure, no markdown, no explanation:\n{\"insights\":[...],\"recommendations\":[...],\"executiveSummary\":\"...\"}",
    prompt: promptParts.join("\n"),
    maxOutputTokens: ANALYZE_MAX_TOKENS,
  });

  const cleaned = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed: unknown = JSON.parse(cleaned);
  const normalized = normalizeRawResponse(parsed);
  return AnalyzeResponseSchema.parse(normalized);
}

// Answers natural-language questions about organizational AI usage.
export async function queryWithLlm(
  context: DashboardContext,
  question: string,
  historyPrefix: string,
): Promise<string> {
  const system = buildQuerySystemPrompt(context);

  const userContent = historyPrefix
    ? `${historyPrefix}User question: ${question}`
    : `User question: ${question}`;

  const { text } = await generateText({
    model: llmModel,
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