import type { AnalyticsData, AnalyzeResponse, AIInsight } from "@/lib/types";

export function buildFallbackAnalyzeResponse(
  data: AnalyticsData,
): AnalyzeResponse {
  const insights: AIInsight[] = data.anomalies.map((anomaly, index) => ({
    id: `fallback-insight-${index}`,
    type: "anomaly",
    severity: anomaly.magnitude.includes("3") ? "critical" : "warning",
    title: `${anomaly.affectedEntity}: ${anomaly.magnitude}`,
    description: anomaly.description,
    affectedEntity: anomaly.affectedEntity,
    confidence: 0.9,
    recommendedAction: `Investigate ${anomaly.affectedEntity} usage during week ${anomaly.week}.`,
  }));

  const lowestRoiTeam = [...data.byTeam].sort((a, b) => a.roi - b.roi)[0];
  if (lowestRoiTeam && lowestRoiTeam.roi < 150) {
    insights.push({
      id: "fallback-insight-marketing",
      type: "risk",
      severity: "warning",
      title: `${lowestRoiTeam.name} ROI below target`,
      description: `${lowestRoiTeam.name} ROI is ${lowestRoiTeam.roi}% on $${lowestRoiTeam.spend.toLocaleString()} spend with ${lowestRoiTeam.wasteRatio * 100}% waste ratio.`,
      affectedEntity: lowestRoiTeam.name,
      estimatedSavings: Math.round(lowestRoiTeam.spend * 0.12),
      confidence: 0.85,
      recommendedAction:
        "Provide targeted AI training and standardize on lower-cost models for routine tasks.",
    });
  }

  const cursor = data.byTool.find((tool) => tool.name === "Cursor");
  if (cursor && cursor.totalSeats > 0 && cursor.seatUtilization < 0.3) {
    insights.push({
      id: "fallback-insight-cursor",
      type: "recommendation",
      severity: "info",
      title: "Cursor seat reclamation opportunity",
      description: `${cursor.totalSeats - cursor.activeSeats} of ${cursor.totalSeats} Cursor seats show limited activity (${Math.round(cursor.seatUtilization * 100)}% utilization).`,
      affectedEntity: "Cursor",
      estimatedSavings: (cursor.totalSeats - cursor.activeSeats) * 32,
      confidence: 0.92,
      recommendedAction: "Reclaim inactive licenses and reassign to active developers.",
    });
  }

  const executiveSummary = `Organization AI spend is $${data.kpis.totalSpend.toLocaleString()} with ${data.kpis.totalROI}% ROI and ${data.kpis.activeUsers} active users in ${data.period}. Top savings opportunity: $${data.kpis.costSavingsOpportunity.toLocaleString()}/month from seat optimization and model routing. ${insights.length} priority signals require attention this month.`;

  return {
    insights: insights.slice(0, 6),
    recommendations: data.recommendations,
    executiveSummary,
  };
}
