import { inferCategoryFromAnomaly } from "@/lib/ai-insights/categories";
import { buildStrategicExecutiveSummary } from "@/lib/ai-insights/executive-summary";
import { formatCurrency } from "@/lib/format";
import { getServerT } from "@/lib/i18n/server";
import { translateTeam, translateTool } from "@/lib/i18n/labels";
import type { AnalyticsData, AnalyzeResponse, AIInsight } from "@/lib/types";

function draftInsight(
  partial: Omit<AIInsight, "category" | "priority" | "whyThisMatters"> &
    Partial<Pick<AIInsight, "category" | "priority" | "whyThisMatters">>,
): AIInsight {
  return {
    category: partial.category ?? "operational",
    priority: partial.priority ?? "medium",
    whyThisMatters: partial.whyThisMatters ?? "",
    ...partial,
  };
}

export function buildFallbackAnalyzeResponse(
  data: AnalyticsData,
): AnalyzeResponse {
  const t = getServerT();

  const insights: AIInsight[] = data.anomalies.map((anomaly, index) =>
    draftInsight({
      id: `fallback-insight-${index}`,
      type: "anomaly",
      severity: anomaly.severityLevel ?? "warning",
      category: inferCategoryFromAnomaly(anomaly),
      title: `${anomaly.affectedEntity}: ${anomaly.magnitude}`,
      description: anomaly.description,
      affectedEntity: anomaly.affectedEntity,
      confidence: 0.9,
      recommendedAction: t("fallbackInsights.0.action", {
        entity: anomaly.affectedEntity,
        week: anomaly.week,
        defaultValue: `Investigate ${anomaly.affectedEntity} usage during week ${anomaly.week}.`,
      }),
    }),
  );

  const lowestRoiTeam = [...data.byTeam].sort((a, b) => a.roi - b.roi)[0];
  if (lowestRoiTeam && lowestRoiTeam.roi < 150) {
    insights.push(
      draftInsight({
        id: "fallback-insight-marketing",
        type: "risk",
        severity: "warning",
        category: "efficiency",
        title: t("fallbackInsights.marketing.title", {
          entity: translateTeam(lowestRoiTeam.name, t),
          defaultValue: `${lowestRoiTeam.name} ROI below target`,
        }),
        description: t("fallbackInsights.marketing.description", {
          entity: translateTeam(lowestRoiTeam.name, t),
          roi: lowestRoiTeam.roi,
          spend: formatCurrency(lowestRoiTeam.spend),
          waste: Math.round(lowestRoiTeam.wasteRatio * 100),
          defaultValue: `${lowestRoiTeam.name} operates below org ROI norms on ${formatCurrency(lowestRoiTeam.spend)} spend with elevated waste—value capture is lagging adoption.`,
        }),
        affectedEntity: lowestRoiTeam.name,
        estimatedSavings: Math.round(lowestRoiTeam.spend * 0.12),
        confidence: 0.85,
        recommendedAction: t("fallbackInsights.marketing.action", {
          defaultValue:
            "Align leadership on outcome metrics before expanding licenses; pair enablement with model standards for routine work.",
        }),
      }),
    );
  }

  const cursor = data.byTool.find((tool) => tool.id === "cursor");
  if (cursor && cursor.totalSeats > 0 && cursor.seatUtilization < 0.3) {
    const inactive = cursor.totalSeats - cursor.activeSeats;
    const utilization = Math.round(cursor.seatUtilization * 100);
    insights.push(
      draftInsight({
        id: "fallback-insight-cursor",
        type: "recommendation",
        severity: "info",
        category: "operational",
        title: t("fallbackInsights.cursor.title", {
          defaultValue: "Cursor seat reclamation opportunity",
        }),
        description: t("fallbackInsights.cursor.description", {
          inactive,
          totalSeats: cursor.totalSeats,
          utilization,
          defaultValue: `${inactive} of ${cursor.totalSeats} Cursor seats show limited activity (${utilization}% utilization)—engineering appears to carry overlapping premium coding capacity without full utilization.`,
        }),
        affectedEntity: "Cursor",
        estimatedSavings: inactive * 32,
        confidence: 0.92,
        recommendedAction: t("fallbackInsights.cursor.action", {
          defaultValue:
            "Review seat allocation with Engineering leadership before renewal cycles.",
        }),
      }),
    );
  }

  const draftInsights = insights.slice(0, 6);
  const dashboardContext = {
    period: data.period,
    totalSpend: data.kpis.totalSpend,
    totalROI: data.kpis.totalROI,
    efficiencyScore: data.kpis.efficiencyScore,
    wasteRatio: data.kpis.wasteRatio,
    hoursSaved: data.kpis.hoursSaved,
    activeUsers: data.kpis.activeUsers,
    underusedSeats: data.kpis.underusedSeats,
    byTeam: data.byTeam,
    byTool: data.byTool,
    byModel: data.byModel,
    anomalies: data.anomalies,
    topSpenders: data.topSpenders,
    lowProductivity: data.lowProductivity,
  };

  const executiveSummary = buildStrategicExecutiveSummary(
    dashboardContext,
    draftInsights,
  );

  return {
    insights: draftInsights,
    recommendations: data.recommendations,
    executiveSummary,
  };
}
