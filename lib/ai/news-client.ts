import { CLAUDE_MODEL } from "@/lib/ai/constants";
import { buildFallbackNewsResponse } from "@/lib/ai/fallback-news";
import { parseAiNewsResponse } from "@/lib/ai/news-validate";
import { extractJsonFromText } from "@/lib/ai/validate";
import type { AiNewsResponse } from "@/lib/types";

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
  "lastUpdated": "ISO-8601 timestamp"
}

Rules:
- Return 6-10 items across all categories
- Use real, verifiable URLs from search results
- Categories must be exactly one of: new-models, pricing, new-tools, industry
- No markdown, no commentary outside JSON`;
}

interface ClaudeTextBlock {
  type: string;
  text?: string;
}

interface ClaudeResponse {
  content: ClaudeTextBlock[];
}

function getApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY;
}

async function callClaudeWithWebSearch(): Promise<string> {
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
      "anthropic-beta": "web-search-2025-03-05",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: NEWS_MAX_TOKENS,
      system: buildNewsSystemPrompt(),
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        },
      ],
      messages: [
        {
          role: "user",
          content:
            "Find the latest enterprise AI news: model releases, pricing updates, new developer tools, and industry governance trends. Return JSON only.",
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude news API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as ClaudeResponse;
  const text = data.content.find((block) => block.type === "text")?.text;
  if (!text) {
    throw new Error("Claude news API returned no text content");
  }
  return text;
}

export function hasClaudeApiKey(): boolean {
  return Boolean(getApiKey());
}

export async function fetchAiNews(): Promise<AiNewsResponse> {
  if (!hasClaudeApiKey()) {
    return buildFallbackNewsResponse();
  }

  try {
    const text = await callClaudeWithWebSearch();
    const parsed = parseAiNewsResponse(extractJsonFromText(text));
    if (!parsed) {
      throw new Error("Invalid news JSON from Claude");
    }
    return parsed;
  } catch {
    return buildFallbackNewsResponse();
  }
}
