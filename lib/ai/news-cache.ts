import { unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";
import { fetchAiNews } from "@/lib/ai/clients/news-client";
import type { AiNewsResponse } from "@/lib/types";

const CACHE_TTL_SECONDS = 60 * 60;

export const getCachedNews: () => Promise<AiNewsResponse> = unstable_cache(
  async () => {
    const result = await fetchAiNews();
    return { ...result, fromCache: false };
  },
  ["ai-news"],
  { revalidate: CACHE_TTL_SECONDS, tags: ["ai-news"] },
);

export function clearNewsCache(): void {
  revalidateTag("ai-news", "page");
}