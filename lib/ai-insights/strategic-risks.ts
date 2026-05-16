import type { AIInsight, DashboardContext } from "@/lib/types";

import type { OrganizationalSignalProfile } from "@/lib/ai-insights/signal-profile";

export function generateStrategicRiskInsights(
  context: DashboardContext,
  profile: OrganizationalSignalProfile,
): AIInsight[] {
  const risks: AIInsight[] = [];

  if (profile.premiumDependencyRatio >= 0.55) {
    risks.push({
      id: "strategic-risk-premium-dependence",
      type: "risk",
      severity: profile.premiumDependencyRatio >= 0.65 ? "critical" : "warning",
      category: "risk",
      priority: profile.premiumDependencyRatio >= 0.65 ? "critical" : "high",
      title: "Excessive premium model dependence",
      description: `${Math.round(profile.premiumDependencyRatio * 100)}% of model spend sits on premium tiers while org ROI is ${context.totalROI}%—the portfolio is structurally exposed to tier-pricing shocks and habituated over-provisioning.`,
      whyThisMatters:
        "Premium dependence is a balance-sheet risk: small pricing or usage shifts create disproportionate spend volatility.",
      affectedEntity: "Organization",
      confidence: 0.86,
      recommendedAction:
        "Mandate a tiering review for top workloads—executives should see a clear map of what truly requires premium models vs. routine tasks.",
    });
  }

  if (profile.vendorConcentrationRatio >= 0.5) {
    const dominant = [...context.byTool].sort((a, b) => b.spend - a.spend)[0];
    risks.push({
      id: "strategic-risk-vendor-concentration",
      type: "risk",
      severity: "warning",
      category: "vendor-risk",
      priority: "high",
      title: "Vendor concentration risk in the AI stack",
      description: `${dominant?.name ?? "A single vendor"} carries ${Math.round(profile.vendorConcentrationRatio * 100)}% of tool spend—negotiation leverage and failover options narrow as the portfolio scales on one platform.`,
      whyThisMatters:
        "Concentration limits optionality during renewals and increases operational risk if vendor pricing, policy, or availability shifts.",
      affectedEntity: dominant?.name ?? "Organization",
      confidence: 0.8,
      recommendedAction:
        "Document contingency workflows on secondary platforms for critical teams before renewal conversations.",
    });
  }

  if (
    profile.adoptionIntensity >= 0.55 &&
    profile.governancePressure >= 0.4 &&
    context.activeUsers > 20
  ) {
    risks.push({
      id: "strategic-risk-uncontrolled-scaling",
      type: "risk",
      severity: "warning",
      category: "governance",
      priority: "high",
      title: "Uncontrolled AI scaling ahead of governance",
      description: `${context.activeUsers} active users and rising adoption intensity are outpacing governance signals—waste and underutilized capacity suggest spend is scaling without proportional operating discipline.`,
      whyThisMatters:
        "Scaling without governance maturity typically produces a sudden executive mandate to cut spend without a plan—more disruptive than proactive portfolio management.",
      affectedEntity: "Organization",
      confidence: 0.78,
      recommendedAction:
        "Introduce spend guardrails and utilization thresholds tied to team-level AI budgets for the next quarter.",
    });
  }

  if (profile.toolFragmentationScore >= 0.55 && profile.activeCodingOverlap) {
    risks.push({
      id: "strategic-risk-tool-ecosystem-fragmentation",
      type: "risk",
      severity: "info",
      category: "operational",
      priority: "medium",
      title: "Fragmented tooling ecosystem",
      description: `Parallel coding and API platforms (${profile.overlappingToolNames.join(", ")}) are active with overlapping spend—fragmentation increases training cost, security surface, and redundant licenses.`,
      whyThisMatters:
        "Fragmented ecosystems erode economies of scale and make ROI attribution nearly impossible at the executive level.",
      affectedEntity: profile.overlappingToolNames[0] ?? "Organization",
      confidence: 0.76,
      recommendedAction:
        "Charge platform engineering with a 90-day consolidation assessment—outcomes should be advisory to leadership, not a tool mandate.",
    });
  }

  if (
    profile.spendAnomalies.length >= 2 ||
    (profile.criticalAnomalies > 0 && profile.laggingRoiTeams.length >= 1)
  ) {
    risks.push({
      id: "strategic-risk-spend-without-maturity",
      type: "risk",
      severity: profile.criticalAnomalies > 0 ? "critical" : "warning",
      category: "financial",
      priority: profile.criticalAnomalies > 0 ? "critical" : "high",
      title: "Rising spend without governance maturity",
      description: `In-period spend signals (${profile.spendAnomalies.length} acceleration patterns, ${profile.criticalAnomalies} critical anomalies) coincide with teams below ROI norms—cost trajectory is worsening before controls catch up.`,
      whyThisMatters:
        "Finance and platform leaders will align on this pattern quickly once surfaced—proactive narrative control matters.",
      affectedEntity: profile.laggingRoiTeams[0] ?? "Organization",
      confidence: 0.82,
      recommendedAction:
        "Brief leadership on spend trajectory and pair it with a governance improvement plan—silence reads as lack of control.",
    });
  }

  return risks.slice(0, 3);
}
