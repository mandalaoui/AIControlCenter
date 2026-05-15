import { formatCurrency } from "@/lib/format";
import { getServerT } from "@/lib/i18n/server";
import { translateTeam, translateTool } from "@/lib/i18n/labels";
import type { AnalyticsData, AnalyzeResponse, AIInsight } from "@/lib/types";

export function buildFallbackAnalyzeResponse(
  data: AnalyticsData,
): AnalyzeResponse {
  const t = getServerT();

  const insights: AIInsight[] = data.anomalies.map((anomaly, index) => ({
    id: `fallback-insight-${index}`,
    type: "anomaly",
    severity: anomaly.magnitude.includes("3") ? "critical" : "warning",
    title: `${anomaly.affectedEntity}: ${anomaly.magnitude}`,
    description: anomaly.description,
    affectedEntity: anomaly.affectedEntity,
    confidence: 0.9,
    recommendedAction: t("fallbackInsights.0.action", {
      entity: anomaly.affectedEntity,
      week: anomaly.week,
      defaultValue: `Investigate ${anomaly.affectedEntity} usage during week ${anomaly.week}.`,
    }),
  }));

  const lowestRoiTeam = [...data.byTeam].sort((a, b) => a.roi - b.roi)[0];
  if (lowestRoiTeam && lowestRoiTeam.roi < 150) {
    insights.push({
      id: "fallback-insight-marketing",
      type: "risk",
      severity: "warning",
      title: t("fallbackInsights.marketing.title", {
        entity: translateTeam(lowestRoiTeam.name, t),
        defaultValue: `${lowestRoiTeam.name} ROI below target`,
      }),
      description: t("fallbackInsights.marketing.description", {
        entity: translateTeam(lowestRoiTeam.name, t),
        roi: lowestRoiTeam.roi,
        spend: formatCurrency(lowestRoiTeam.spend),
        waste: Math.round(lowestRoiTeam.wasteRatio * 100),
        defaultValue: `${lowestRoiTeam.name} ROI is ${lowestRoiTeam.roi}% on ${formatCurrency(lowestRoiTeam.spend)} spend with ${lowestRoiTeam.wasteRatio * 100}% waste ratio.`,
      }),
      affectedEntity: lowestRoiTeam.name,
      estimatedSavings: Math.round(lowestRoiTeam.spend * 0.12),
      confidence: 0.85,
      recommendedAction: t("fallbackInsights.marketing.action", {
        defaultValue:
          "Provide targeted AI training and standardize on lower-cost models for routine tasks.",
      }),
    });
  }

  const cursor = data.byTool.find((tool) => tool.name === "Cursor");
  if (cursor && cursor.totalSeats > 0 && cursor.seatUtilization < 0.3) {
    const inactive = cursor.totalSeats - cursor.activeSeats;
    const utilization = Math.round(cursor.seatUtilization * 100);
    insights.push({
      id: "fallback-insight-cursor",
      type: "recommendation",
      severity: "info",
      title: t("fallbackInsights.cursor.title", {
        defaultValue: "Cursor seat reclamation opportunity",
      }),
      description: t("fallbackInsights.cursor.description", {
        inactive,
        totalSeats: cursor.totalSeats,
        utilization,
        defaultValue: `${inactive} of ${cursor.totalSeats} Cursor seats show limited activity (${utilization}% utilization).`,
      }),
      affectedEntity: "Cursor",
      estimatedSavings: inactive * 32,
      confidence: 0.92,
      recommendedAction: t("fallbackInsights.cursor.action", {
        defaultValue:
          "Reclaim inactive licenses and reassign to active developers.",
      }),
    });
  }

  const executiveSummary = t("fallbackAnalyze.executiveSummary", {
    spend: formatCurrency(data.kpis.totalSpend),
    roi: data.kpis.totalROI,
    activeUsers: data.kpis.activeUsers,
    period: data.period,
    savings: formatCurrency(data.kpis.costSavingsOpportunity),
    signals: insights.length,
    defaultValue: `Organization AI spend is ${formatCurrency(data.kpis.totalSpend)} with ${data.kpis.totalROI}% ROI and ${data.kpis.activeUsers} active users in ${data.period}. Top savings opportunity: ${formatCurrency(data.kpis.costSavingsOpportunity)}/month from seat optimization and model routing. ${insights.length} priority signals require attention this month.`,
  });

  return {
    insights: insights.slice(0, 6),
    recommendations: data.recommendations,
    executiveSummary,
  };
}
