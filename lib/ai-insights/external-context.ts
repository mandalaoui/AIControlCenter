import { buildFallbackNewsResponse } from "@/lib/ai/fallback-news";
import { getCachedNews } from "@/lib/ai/news-cache";
import type { AiNewsResponse, NewsCategory, NewsItem } from "@/lib/types";

/** Grounded external signal — derived only from NewsItem records. */
export interface ExternalNewsSignal {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: NewsCategory;
  publishedAt: string;
}

export interface ExternalInsightContext {
  lastUpdated: string;
  fromCache: boolean;
  newModels: ExternalNewsSignal[];
  pricingChanges: ExternalNewsSignal[];
  emergingTools: ExternalNewsSignal[];
  industryTrends: ExternalNewsSignal[];
  enterprisePractices: ExternalNewsSignal[];
  /** All signals for iteration — never invent beyond this list. */
  allSignals: ExternalNewsSignal[];
}

function toSignal(item: NewsItem): ExternalNewsSignal {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    source: item.source,
    category: item.category,
    publishedAt: item.publishedAt,
  };
}

export function buildExternalContextFromNews(
  news: AiNewsResponse,
): ExternalInsightContext {
  const allSignals = news.items.map(toSignal);

  return {
    lastUpdated: news.lastUpdated,
    fromCache: news.fromCache,
    newModels: allSignals.filter((s) => s.category === "new-models"),
    pricingChanges: allSignals.filter((s) => s.category === "pricing"),
    emergingTools: allSignals.filter((s) => s.category === "new-tools"),
    industryTrends: allSignals.filter((s) => s.category === "industry"),
    enterprisePractices: allSignals.filter((s) => s.category === "industry"),
    allSignals,
  };
}

export async function loadExternalInsightContext(): Promise<ExternalInsightContext> {
  try {
    const news = await getCachedNews();
    return buildExternalContextFromNews(news);
  } catch {
    return buildExternalContextFromNews(buildFallbackNewsResponse());
  }
}

export function formatExternalContextForPrompt(
  context: ExternalInsightContext,
): string {
  if (context.allSignals.length === 0) {
    return "";
  }

  const formatSignal = (s: ExternalNewsSignal) =>
    `[${s.id}] (${s.category}, ${s.source}, ${s.publishedAt}) ${s.title}: ${s.summary}`;

  const sections: string[] = [
    "External AI market context (use ONLY these verified signals — do not invent pricing, releases, or vendors):",
    "",
    "New models:",
    ...context.newModels.map((s) => `- ${formatSignal(s)}`),
    "",
    "Pricing changes:",
    ...context.pricingChanges.map((s) => `- ${formatSignal(s)}`),
    "",
    "Emerging tools:",
    ...context.emergingTools.map((s) => `- ${formatSignal(s)}`),
    "",
    "Industry trends & enterprise practices:",
    ...context.industryTrends.map((s) => `- ${formatSignal(s)}`),
  ];

  return sections.filter((line) => line !== "" || sections.indexOf(line) === 0).join("\n");
}

export function findSignalsMatching(
  context: ExternalInsightContext,
  terms: string[],
): ExternalNewsSignal[] {
  const normalized = terms.map((t) => t.toLowerCase());
  return context.allSignals.filter((signal) => {
    const text = `${signal.title} ${signal.summary} ${signal.source}`.toLowerCase();
    return normalized.some((term) => text.includes(term));
  });
}
