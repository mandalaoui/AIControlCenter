import { getServerT } from "@/lib/i18n/server";
import type { AiNewsResponse, NewsItem } from "@/lib/types";

const FALLBACK_NEWS_IDS = [
  "fb-1",
  "fb-2",
  "fb-3",
  "fb-4",
  "fb-5",
  "fb-6",
  "fb-7",
  "fb-8",
] as const;

const FALLBACK_NEWS_META: Record<
  (typeof FALLBACK_NEWS_IDS)[number],
  Omit<NewsItem, "title" | "summary">
> = {
  "fb-1": {
    id: "fb-1",
    source: "Anthropic",
    category: "new-models",
    url: "https://www.anthropic.com/news",
    publishedAt: "2025-05-01",
  },
  "fb-2": {
    id: "fb-2",
    source: "OpenAI",
    category: "pricing",
    url: "https://openai.com/pricing",
    publishedAt: "2025-04-28",
  },
  "fb-3": {
    id: "fb-3",
    source: "GitHub",
    category: "new-tools",
    url: "https://github.blog",
    publishedAt: "2025-04-25",
  },
  "fb-4": {
    id: "fb-4",
    source: "Industry",
    category: "industry",
    url: "https://example.com/ai-governance",
    publishedAt: "2025-04-20",
  },
  "fb-5": {
    id: "fb-5",
    source: "Google",
    category: "new-models",
    url: "https://ai.google.dev",
    publishedAt: "2025-04-18",
  },
  "fb-6": {
    id: "fb-6",
    source: "Cursor",
    category: "new-tools",
    url: "https://cursor.com",
    publishedAt: "2025-04-15",
  },
  "fb-7": {
    id: "fb-7",
    source: "Microsoft",
    category: "pricing",
    url: "https://www.microsoft.com/microsoft-365",
    publishedAt: "2025-04-12",
  },
  "fb-8": {
    id: "fb-8",
    source: "Slack",
    category: "new-tools",
    url: "https://slack.com/ai",
    publishedAt: "2025-04-10",
  },
};

export function buildFallbackNewsResponse(): AiNewsResponse {
  const t = getServerT();
  const items: NewsItem[] = FALLBACK_NEWS_IDS.map((id) => {
    const meta = FALLBACK_NEWS_META[id];
    return {
      ...meta,
      title: t(`fallbackNews.${id}.title`),
      summary: t(`fallbackNews.${id}.summary`),
    };
  });

  return {
    items,
    lastUpdated: new Date().toISOString(),
    fromCache: false,
  };
}
