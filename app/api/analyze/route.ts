import { NextResponse } from "next/server";

import { buildFallbackAnalyzeResponse } from "@/lib/ai/fallback-analyze";
import { analyzeWithLlm, hasLlmApiKey } from "@/lib/ai/clients/llm-client";
import {
  enrichAnalyzeResponse,
  formatExternalContextForPrompt,
  loadExternalInsightContext,
} from "@/lib/ai-insights";
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

    const external = await loadExternalInsightContext();
    const externalBlock = formatExternalContextForPrompt(external);

    if (hasLlmApiKey()) {
      try {
        const result = await analyzeWithLlm(context, externalBlock);
        return NextResponse.json(
          enrichAnalyzeResponse(context, result, { external }),
        );
      } catch (err) {
        console.error("[analyze] LLM failed, using fallback:", err);
        const analytics = computeAnalyticsData();
        const fallbackContext = buildDashboardContext(analytics);
        return NextResponse.json(
          enrichAnalyzeResponse(
            fallbackContext,
            buildFallbackAnalyzeResponse(analytics),
            { external },
          ),
        );
      }
    }

    const analytics = computeAnalyticsData();
    const fallbackContext = buildDashboardContext(analytics);
    return NextResponse.json(
      enrichAnalyzeResponse(
        fallbackContext,
        buildFallbackAnalyzeResponse(analytics),
        { external },
      ),
    );
  } catch (error) {
    const t = getServerT();
    const message =
      error instanceof Error ? error.message : t("apiErrors.analyzeFailed");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
