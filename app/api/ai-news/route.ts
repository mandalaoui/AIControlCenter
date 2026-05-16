import { NextResponse } from "next/server";

import { buildFallbackNewsResponse } from "@/lib/ai/fallback-news";
import { clearNewsCache, getCachedNews } from "@/lib/ai/news-cache";
import { fetchAiNews } from "@/lib/ai/clients/news-client";
import { getServerT } from "@/lib/i18n/server";
import type { AiNewsResponse } from "@/lib/types";

// Note: All caching is handled in /lib/ai/news-cache.ts via unstable_cache & revalidateTag

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("refresh") === "true";

    let response: AiNewsResponse;

    if (!forceRefresh) {
      // May throw if underlying fetch fails, fallback handled below
      response = await getCachedNews();
      return NextResponse.json(response);
    } else {
      // Invalidate before fresh fetch
      clearNewsCache();
      try {
        response = await fetchAiNews();
      } catch {
        response = buildFallbackNewsResponse();
      }
      return NextResponse.json(response);
    }
  } catch (error) {
    // If we failed, hard fallback: try cache, otherwise fallback stub with error message
    try {
      const cached = await getCachedNews();
      return NextResponse.json(cached);
    } catch {
      // If cached also fails, return error and fallback
      const t = await getServerT();
      const message =
        error instanceof Error ? error.message : t("apiErrors.newsFailed");
      return NextResponse.json(
        {
          error: message,
          ...buildFallbackNewsResponse(),
        },
        { status: 200 },
      );
    }
  }
}
