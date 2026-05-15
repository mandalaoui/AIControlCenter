import type { AiNewsResponse, NewsCategory, NewsItem } from "@/lib/types";

const VALID_CATEGORIES: NewsCategory[] = [
  "new-models",
  "pricing",
  "new-tools",
  "industry",
];

function isNewsCategory(value: unknown): value is NewsCategory {
  return (
    typeof value === "string" &&
    VALID_CATEGORIES.includes(value as NewsCategory)
  );
}

function parseNewsItem(raw: unknown, index: number): NewsItem | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const title = typeof item.title === "string" ? item.title.trim() : "";
  const summary = typeof item.summary === "string" ? item.summary.trim() : "";
  const source = typeof item.source === "string" ? item.source.trim() : "";
  const url = typeof item.url === "string" ? item.url.trim() : "";

  if (!title || !summary || !source || !url || !isNewsCategory(item.category)) {
    return null;
  }

  const id =
    typeof item.id === "string" && item.id.trim().length > 0
      ? item.id.trim()
      : `news-${index + 1}`;

  const publishedAt =
    typeof item.publishedAt === "string" && item.publishedAt.trim().length > 0
      ? item.publishedAt.trim()
      : new Date().toISOString().slice(0, 10);

  return { id, title, summary, source, url, category: item.category, publishedAt };
}

export function parseAiNewsResponse(raw: unknown): AiNewsResponse | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const payload = raw as Record<string, unknown>;
  if (!Array.isArray(payload.items)) {
    return null;
  }

  const items = payload.items
    .map((item, index) => parseNewsItem(item, index))
    .filter((item): item is NewsItem => item !== null);

  if (items.length === 0) {
    return null;
  }

  const lastUpdated =
    typeof payload.lastUpdated === "string" && payload.lastUpdated.length > 0
      ? payload.lastUpdated
      : new Date().toISOString();

  return { items, lastUpdated, fromCache: false };
}
