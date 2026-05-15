import type { AiNewsResponse } from "@/lib/types";

const CACHE_TTL_MS = 60 * 60 * 1000;

let cachedNews: AiNewsResponse | null = null;
let cacheExpiresAt = 0;

export function getCachedNews(): AiNewsResponse | null {
  if (!cachedNews || Date.now() >= cacheExpiresAt) {
    return null;
  }
  return { ...cachedNews, fromCache: true };
}

export function setCachedNews(response: AiNewsResponse): void {
  cachedNews = response;
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
}

export function clearNewsCache(): void {
  cachedNews = null;
  cacheExpiresAt = 0;
}
