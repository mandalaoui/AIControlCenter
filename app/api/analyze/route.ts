import { NextResponse } from "next/server";

import { buildFallbackAnalyzeResponse } from "@/lib/ai/fallback-analyze";
import { analyzeWithLlm, hasLlmApiKey } from "@/lib/ai/clients/llm-client";
import {
  buildDashboardContext,
  computeAnalyticsData,
} from "@/lib/analytics";
import { getServerT } from "@/lib/i18n/server";
import type { DashboardContext } from "@/lib/types";

export async function POST(request: Request) {
  try {
    let context: DashboardContext;
    const body = (await request.json().catch(() => null)) as {
      data?: DashboardContext;
    } | null;

    if (body?.data?.period && body.data.byTeam) {
      context = body.data;
    } else {
      const analytics = computeAnalyticsData();
      context = buildDashboardContext(analytics);
    }

    if (hasLlmApiKey()) {
      try {
        const result = await analyzeWithLlm(context);
        return NextResponse.json(result);
      } catch {
        const analytics = computeAnalyticsData();
        return NextResponse.json(buildFallbackAnalyzeResponse(analytics));
      }
    }

    const analytics = computeAnalyticsData();
    return NextResponse.json(buildFallbackAnalyzeResponse(analytics));
  } catch (error) {
    const t = getServerT();
    const message =
      error instanceof Error ? error.message : t("apiErrors.analyzeFailed");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
