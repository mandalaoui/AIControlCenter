import { NextResponse } from "next/server";

import { buildFallbackAnalyzeResponse } from "@/lib/ai/fallback-analyze";
import { analyzeWithClaude, hasClaudeApiKey } from "@/lib/ai/claude-client";
import {
  buildDashboardContext,
  computeAnalyticsData,
} from "@/lib/analytics";
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

    if (hasClaudeApiKey()) {
      try {
        const result = await analyzeWithClaude(context);
        return NextResponse.json(result);
      } catch {
        const analytics = computeAnalyticsData();
        return NextResponse.json(buildFallbackAnalyzeResponse(analytics));
      }
    }

    const analytics = computeAnalyticsData();
    return NextResponse.json(buildFallbackAnalyzeResponse(analytics));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Analyze request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
