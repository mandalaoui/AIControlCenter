import type { AIInsight, DashboardContext } from "@/lib/types";

import type { OrganizationalSignalProfile } from "@/lib/ai-insights/signal-profile";

function formatWhatChangedPrefix(text: string): string {
  return text.startsWith("What changed") ? text : `What changed: ${text}`;
}

export function generateWhatChangedInsights(
  context: DashboardContext,
  profile: OrganizationalSignalProfile,
): AIInsight[] {
  const insights: AIInsight[] = [];

  const spendAnomalies = context.anomalies.filter((a) =>
    /spend|cost|surge|spike|increase|growth/i.test(
      `${a.description} ${a.magnitude}`,
    ),
  );

  if (spendAnomalies.length > 0) {
    const primary = spendAnomalies[0];
    const entity = primary.affectedEntity;
    insights.push({
      id: "strategic-change-spend-acceleration",
      type: "trend",
      severity: primary.severityLevel === "critical" ? "critical" : "warning",
      category: "financial",
      priority: primary.severityLevel === "critical" ? "high" : "medium",
      title: `Accelerating spend detected for ${entity}`,
      description: `${formatWhatChangedPrefix(primary.description)} (${primary.magnitude}, ${primary.week}). Trajectory: spend is moving faster than historical baselines for this entity—leadership should treat this as an early escalation, not noise.`,
      whyThisMatters:
        "Spend acceleration without a matching ROI narrative is the most common trigger for executive intervention in AI budgets.",
      affectedEntity: entity,
      confidence: 0.83,
      recommendedAction:
        "Request a two-week spend attribution review for the affected entity before approving additional capacity.",
    });
  }

  if (profile.laggingRoiTeams.length >= 2) {
    const teams = profile.laggingRoiTeams.slice(0, 2).join(" and ");
    const avgLagRoi = Math.round(
      context.byTeam
        .filter((t) => profile.laggingRoiTeams.includes(t.name))
        .reduce((s, t) => s + t.roi, 0) /
        Math.max(profile.laggingRoiTeams.length, 1),
    );
    insights.push({
      id: "strategic-change-roi-erosion",
      type: "trend",
      severity: "warning",
      category: "efficiency",
      priority: "medium",
      title: "ROI erosion emerging across multiple teams",
      description: formatWhatChangedPrefix(
        `${teams} now trail the org ROI baseline (${context.totalROI}%) with blended ROI near ${avgLagRoi}%—the gap is widening, not stabilizing.`,
      ),
      whyThisMatters:
        "Multi-team ROI erosion signals a systemic workflow or standards issue, not isolated underperformance.",
      affectedEntity: profile.laggingRoiTeams[0],
      confidence: 0.75,
      recommendedAction:
        "Benchmark high-ROI teams' model and tool patterns against laggards—look for transferable practices, not blanket cuts.",
    });
  }

  if (
    profile.adoptionIntensity >= 0.6 &&
    profile.lowProductivityCount >= 3 &&
    !insights.some((i) => i.id === "strategic-change-spend-acceleration")
  ) {
    insights.push({
      id: "strategic-change-adoption-spike",
      type: "trend",
      severity: "info",
      category: "adoption",
      priority: "medium",
      title: "Rapid adoption spike with uneven outcomes",
      description: formatWhatChangedPrefix(
        `Active users reached ${context.activeUsers} while ${profile.lowProductivityCount} high-spend users show weak productivity signals—adoption velocity is outpacing outcome discipline.`,
      ),
      whyThisMatters:
        "Adoption spikes without outcome guardrails predict a costly normalization phase when finance asks for proof of value.",
      affectedEntity: "Organization",
      confidence: 0.74,
      recommendedAction:
        "Pair the adoption milestone with published productivity expectations per role—clarity prevents silent waste.",
    });
  }

  if (
    profile.toolFragmentationScore >= 0.45 &&
    profile.underutilizedToolCount >= 2 &&
    insights.length < 2
  ) {
    insights.push({
      id: "strategic-change-fragmentation",
      type: "trend",
      severity: "info",
      category: "operational",
      priority: "medium",
      title: "Increasing operational fragmentation",
      description: formatWhatChangedPrefix(
        `${profile.underutilizedToolCount} tools show weak utilization while overlapping platforms remain active—fragmentation is increasing, not consolidating.`,
      ),
      whyThisMatters:
        "Rising fragmentation is a leading indicator of duplicate spend and unclear ownership in the next renewal cycle.",
      affectedEntity: "Organization",
      confidence: 0.73,
      recommendedAction:
        "Ask team leads to declare primary vs. experimental tools for each function—visibility precedes consolidation decisions.",
    });
  }

  return insights.slice(0, 2);
}
