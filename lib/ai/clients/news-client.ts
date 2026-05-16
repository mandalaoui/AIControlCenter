import { buildFallbackNewsResponse } from "@/lib/ai/fallback-news";
import type { AiNewsResponse } from "@/lib/types";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { AiNewsResponseSchema } from "@/lib/ai/news-schema";
import { hasLlmApiKey } from "@/lib/ai/clients/llm-client";
import { CLAUDE_MODEL } from "@/lib/ai/constants";

const NEWS_MAX_TOKENS = 1500;

function buildNewsSystemPrompt(): string {
  return `You are an AI industry news curator for an enterprise AI cost intelligence platform.
Search the web for recent (last 30 days) AI industry news relevant to enterprise buyers: new models, pricing changes, new tools, and industry trends.
Write title and summary fields in English.

Return ONLY valid JSON with this exact shape:
{
  "items": [
    {
      "id": "unique-string",
      "title": "headline",
      "summary": "2-3 sentence summary",
      "source": "publisher name",
      "category": "new-models" | "pricing" | "new-tools" | "industry",
      "url": "https://...",
      "publishedAt": "YYYY-MM-DD"
    }
  ],
  "lastUpdated": "ISO-8601 timestamp",
  "fromCache": false
}

Rules:
- Return 6-10 items across all categories
- Use real, verifiable URLs from search results
- Categories must be exactly one of: new-models, pricing, new-tools, industry
- No markdown, no commentary outside JSON
- Always include the 'fromCache' boolean field set to false.`;
}

export async function fetchAiNews(): Promise<AiNewsResponse> {
  if (!hasLlmApiKey()) {
    return buildFallbackNewsResponse();
  }

  try {
    const { text } = await generateText({
      model: anthropic(CLAUDE_MODEL),
      system: buildNewsSystemPrompt(),
      prompt: `
        Find the latest enterprise AI industry news from the last 30 days.

        Focus on:
        - new LLM releases
        - pricing updates
        - enterprise AI tooling
        - AI governance
        - coding assistants
        - AI infrastructure vendors

        Prioritize:
        OpenAI, Anthropic, Google Gemini, Cursor, GitHub Copilot, Microsoft, Meta, AWS, NVIDIA, Databricks, OpenRouter.

        Return realistic and verifiable results only.
        Always include the 'fromCache' boolean field set to false.
      `,
      maxOutputTokens: NEWS_MAX_TOKENS,
      tools: {
        web_search: anthropic.tools.webSearch_20250305({
          maxUses: 5,
        }),
      },
    });

    const parsed = AiNewsResponseSchema.parse(JSON.parse(text));
    return parsed;
  } catch {
    return buildFallbackNewsResponse();
  }
}