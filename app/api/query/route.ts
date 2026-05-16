import { NextResponse } from "next/server";

import {
  HISTORY_MAX_CHARS,
  HISTORY_MAX_MESSAGES,
} from "@/lib/ai/constants";
import {
  hasLlmApiKey,
  queryWithLlm,
  sanitizeQueryHistory,
} from "@/lib/ai/clients/llm-client";
import { formatConversationHistory } from "@/lib/ai/prompts";
import {
  buildDashboardContext,
  computeAnalyticsData,
} from "@/lib/analytics";
import { formatCurrency, formatNumber } from "@/lib/format";
import { getServerT } from "@/lib/i18n/server";
import { translateTeam, translateTool } from "@/lib/i18n/labels";
import type { QueryMessage } from "@/lib/types";

interface QueryRequestBody {
  question?: string;
  history?: QueryMessage[];
}

function buildFallbackAnswer(question: string): string {
  const t = getServerT();
  const analytics = computeAnalyticsData();
  const context = buildDashboardContext(analytics);
  const q = question.toLowerCase();

  if (q.includes("overspent") || q.includes("team")) {
    const top = [...context.byTeam].sort((a, b) => b.spend - a.spend)[0];
    const low = [...context.byTeam].sort((a, b) => a.roi - b.roi)[0];
    return t("fallbackQuery.teamOverspend", {
      spend: formatCurrency(top?.spend ?? 0),
      roi: top?.roi ?? 0,
      lowTeam: translateTeam(low?.name ?? "Marketing", t),
      lowRoi: low?.roi ?? 0,
    });
  }
  if (q.includes("lowest roi") || q.includes("worst")) {
    const low = [...context.byTool].sort((a, b) => a.roi - b.roi)[0];
    return t("fallbackQuery.lowestRoi", {
      tool: translateTool(low?.name ?? "Slack AI", t),
      roi: low?.roi ?? 0,
      utilization: Math.round((low?.seatUtilization ?? 0) * 100),
    });
  }
  if (q.includes("cut") || q.includes("savings") || q.includes("reduce")) {
    const seatSavings = context.byTool.reduce(
      (sum, tool) =>
        sum +
        (tool.totalSeats > 0
          ? Math.max(0, tool.totalSeats - tool.activeSeats) * 20
          : 0),
      0,
    );
    return t("fallbackQuery.savings", {
      seatSavings: formatCurrency(seatSavings),
      totalSavings: formatCurrency(analytics.kpis.costSavingsOpportunity),
    });
  }
  if (q.includes("spike") || q.includes("anomal")) {
    const anomaly = context.anomalies[0];
    if (!anomaly) {
      return t("fallbackQuery.noAnomaly");
    }
    return t("fallbackQuery.spike", {
      description: anomaly.description,
      magnitude: anomaly.magnitude,
      entity: anomaly.affectedEntity,
      week: anomaly.week,
    });
  }

  return t("fallbackQuery.default", {
    spend: formatCurrency(context.totalSpend),
    roi: context.totalROI,
    hoursSaved: formatNumber(context.hoursSaved, 0),
    underusedSeats: context.underusedSeats,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QueryRequestBody;
    const question = body.question?.trim();
    const t = getServerT();

    if (!question) {
      return NextResponse.json(
        { error: t("apiErrors.questionRequired") },
        { status: 400 },
      );
    }

    const history = sanitizeQueryHistory(body.history ?? []);
    const analytics = computeAnalyticsData();
    const context = buildDashboardContext(analytics);
    const historyPrefix = formatConversationHistory(
      history,
      HISTORY_MAX_MESSAGES,
      HISTORY_MAX_CHARS,
    );
    console.log("API KEY EXISTS:", hasLlmApiKey());

    if (hasLlmApiKey()) {
      try {
        const answer = await queryWithLlm(context, question, historyPrefix);
        return NextResponse.json({ answer });
      } catch (err) {
        console.error("LLM query failed:", err);
        return NextResponse.json({
          answer: buildFallbackAnswer(question),
        });
      }
    }

    return NextResponse.json({
      answer: buildFallbackAnswer(question),
    });
  } catch (error) {
    const t = getServerT();
    const message =
      error instanceof Error ? error.message : t("apiErrors.queryFailed");
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
