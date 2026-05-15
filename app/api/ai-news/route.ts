import { NextResponse } from "next/server";

import { buildFallbackNewsResponse } from "@/lib/ai/fallback-news";
import { clearNewsCache, getCachedNews, setCachedNews } from "@/lib/ai/news-cache";
import { fetchAiNews } from "@/lib/ai/news-client";
import type { AiNewsResponse } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    if (!forceRefresh) {
      const cached = getCachedNews();
      if (cached) {
        return NextResponse.json(cached);
      }
    } else {
      clearNewsCache();
    }

    let response: AiNewsResponse;
    try {
      response = await fetchAiNews();
    } catch {
      response = buildFallbackNewsResponse();
    }

    setCachedNews(response);
    return NextResponse.json(response);
  } catch (error) {
    const cached = getCachedNews();
    if (cached) {
      return NextResponse.json(cached);
    }

    const message =
      error instanceof Error ? error.message : "AI news request failed";
    return NextResponse.json(
      { error: message, ...buildFallbackNewsResponse() },
      { status: 200 },
    );
  }
}
