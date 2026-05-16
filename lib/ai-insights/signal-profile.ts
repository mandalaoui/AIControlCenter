import type { DashboardContext, Tool } from "@/lib/types";

const PREMIUM_MODELS = new Set([
  "GPT-4",
  "GPT-4o",
  "Claude Opus",
  "Gemini Ultra",
]);

const CODING_TOOLS = new Set<Tool>([
  "GitHub Copilot",
  "Cursor",
  "OpenAI API",
  "Anthropic API",
]);

export interface OrganizationalSignalProfile {
  period: string;
  premiumDependencyRatio: number;
  toolFragmentationScore: number;
  vendorConcentrationRatio: number;
  roiDispersion: number;
  governancePressure: number;
  adoptionIntensity: number;
  experimentationScore: number;
  standardizationGap: number;
  activeCodingOverlap: boolean;
  overlappingToolNames: string[];
  topSpendTeam: string | null;
  laggingRoiTeams: string[];
  highWasteTeams: string[];
  spendAnomalies: string[];
  criticalAnomalies: number;
  underutilizedToolCount: number;
  lowProductivityCount: number;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function buildOrganizationalSignalProfile(
  context: DashboardContext,
): OrganizationalSignalProfile {
  const totalModelSpend = context.byModel.reduce((s, m) => s + m.spend, 0);
  const premiumSpend = context.byModel
    .filter((m) => PREMIUM_MODELS.has(m.name))
    .reduce((s, m) => s + m.spend, 0);

  const toolsWithSpend = context.byTool.filter((t) => t.spend > 0);
  const underutilized = toolsWithSpend.filter(
    (t) => t.totalSeats > 0 && t.seatUtilization < 0.4,
  );
  const codingToolsActive = toolsWithSpend.filter((t) =>
    CODING_TOOLS.has(t.name),
  );
  const activeCodingOverlap = codingToolsActive.length >= 2;

  const totalToolSpend = toolsWithSpend.reduce((s, t) => s + t.spend, 0);
  const topToolSpend = toolsWithSpend.sort((a, b) => b.spend - a.spend)[0]?.spend ?? 0;
  const vendorConcentrationRatio =
    totalToolSpend > 0 ? topToolSpend / totalToolSpend : 0;

  const teamRois = context.byTeam.map((t) => t.roi);
  const roiDispersion = stdDev(teamRois);

  const avgMismatch =
    context.byModel.length > 0
      ? context.byModel.reduce((s, m) => s + m.mismatchRate, 0) /
        context.byModel.length
      : 0;

  const governancePressure = Math.min(
    1,
    context.wasteRatio * 0.4 +
      (underutilized.length / Math.max(toolsWithSpend.length, 1)) * 0.3 +
      avgMismatch * 0.3,
  );

  const adoptionIntensity = Math.min(
    1,
    context.activeUsers / Math.max(context.byTeam.length * 8, 1),
  );

  const experimentationScore = Math.min(
    1,
    (toolsWithSpend.length / 6) * 0.5 + (context.byModel.length / 8) * 0.5,
  );

  const standardizationGap = Math.min(
    1,
    roiDispersion / 80 + toolsWithSpend.length / 10 + avgMismatch,
  );

  const toolFragmentationScore = Math.min(
    1,
    underutilized.length / Math.max(toolsWithSpend.length, 1) +
      (activeCodingOverlap ? 0.25 : 0),
  );

  const topSpendTeam =
    [...context.byTeam].sort((a, b) => b.spend - a.spend)[0] ?? null;

  const laggingRoiTeams = context.byTeam
    .filter((t) => t.roi < context.totalROI * 0.8)
    .map((t) => t.name);

  const highWasteTeams = context.byTeam
    .filter((t) => t.wasteRatio > context.wasteRatio * 1.15)
    .map((t) => t.name);

  const spendAnomalies = context.anomalies
    .filter((a) => /spend|cost|surge|spike|growth/i.test(a.description + a.magnitude))
    .map((a) => a.description);

  const criticalAnomalies = context.anomalies.filter(
    (a) => a.severityLevel === "critical",
  ).length;

  return {
    period: context.period,
    premiumDependencyRatio:
      totalModelSpend > 0 ? premiumSpend / totalModelSpend : 0,
    toolFragmentationScore,
    vendorConcentrationRatio,
    roiDispersion,
    governancePressure,
    adoptionIntensity,
    experimentationScore,
    standardizationGap,
    activeCodingOverlap,
    overlappingToolNames: codingToolsActive.map((t) => t.name),
    topSpendTeam: topSpendTeam?.name ?? null,
    laggingRoiTeams,
    highWasteTeams,
    spendAnomalies,
    criticalAnomalies,
    underutilizedToolCount: underutilized.length,
    lowProductivityCount: context.lowProductivity.length,
  };
}
