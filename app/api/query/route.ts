import { NextResponse } from "next/server";

import {
  HISTORY_MAX_CHARS,
  HISTORY_MAX_MESSAGES,
} from "@/lib/ai/constants";
import {
  hasClaudeApiKey,
  queryWithClaude,
  sanitizeQueryHistory,
} from "@/lib/ai/claude-client";
import { formatConversationHistory } from "@/lib/ai/prompts";
import {
  buildDashboardContext,
  computeAnalyticsData,
} from "@/lib/analytics";
import type { QueryMessage } from "@/lib/types";

interface QueryRequestBody {
  question?: string;
  history?: QueryMessage[];
}

function buildFallbackAnswer(question: string): string {
  const analytics = computeAnalyticsData();
  const context = buildDashboardContext(analytics);
  const q = question.toLowerCase();

  if (q.includes("overspent") || q.includes("team")) {
    const top = [...context.byTeam].sort((a, b) => b.spend - a.spend)[0];
    const low = [...context.byTeam].sort((a, b) => a.roi - b.roi)[0];
    return `Engineering has the highest spend at $${top?.spend.toLocaleString() ?? "0"} with ${top?.roi ?? 0}% ROI. ${low?.name ?? "Marketing"} has the lowest ROI at ${low?.roi ?? 0}% — review model selection and training there first.`;
  }
  if (q.includes("lowest roi") || q.includes("worst")) {
    const low = [...context.byTool].sort((a, b) => a.roi - b.roi)[0];
    return `${low?.name ?? "Slack AI"} has the lowest tool ROI at ${low?.roi ?? 0}% with ${Math.round((low?.seatUtilization ?? 0) * 100)}% seat utilization. Consider right-sizing licenses before expanding other tools.`;
  }
  if (q.includes("cut") || q.includes("savings") || q.includes("reduce")) {
    return `Top safe savings: reclaim underused seats ($${context.byTool.reduce((sum, t) => sum + (t.totalSeats > 0 ? Math.max(0, t.totalSeats - t.activeSeats) * 20 : 0), 0).toLocaleString()}/mo est.), downgrade Claude Opus on low-complexity tasks, and improve Marketing workflows. Total identified opportunity: $${analytics.kpis.costSavingsOpportunity.toLocaleString()}/month.`;
  }
  if (q.includes("spike") || q.includes("anomal")) {
    const anomaly = context.anomalies[0];
    return anomaly
      ? `${anomaly.description} Magnitude: ${anomaly.magnitude}. Affected: ${anomaly.affectedEntity} (${anomaly.week}).`
      : "No major anomalies detected in the current period data.";
  }

  return `Total AI spend is $${context.totalSpend.toLocaleString()} with ${context.totalROI}% ROI, ${context.hoursSaved.toLocaleString()} hours saved, and ${context.underusedSeats} underused seats. Ask about a specific team, tool, or user for a deeper answer.`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QueryRequestBody;
    const question = body.question?.trim();

    if (!question) {
      return NextResponse.json(
        { error: "question is required" },
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

    if (hasClaudeApiKey()) {
      try {
        const answer = await queryWithClaude(context, question, historyPrefix);
        return NextResponse.json({ answer });
      } catch {
        return NextResponse.json({ answer: buildFallbackAnswer(question) });
      }
    }

    return NextResponse.json({ answer: buildFallbackAnswer(question) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Query request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
