import type { AIInsight, DashboardContext } from "@/lib/types";

import type { OrganizationalSignalProfile } from "@/lib/ai-insights/signal-profile";

function strategicInsight(
  partial: Omit<AIInsight, "priority"> & { priority?: AIInsight["priority"] },
): AIInsight {
  return { priority: "medium", ...partial };
}

/**
 * Combines spend, ROI, overlap, premium dependency, and fragmentation
 * into Head-of-AI-Ops style organizational narratives.
 */
export function generateMultiSignalInsights(
  context: DashboardContext,
  profile: OrganizationalSignalProfile,
): AIInsight[] {
  const insights: AIInsight[] = [];
  const topTeam = profile.topSpendTeam;

  if (
    topTeam &&
    profile.activeCodingOverlap &&
    profile.premiumDependencyRatio >= 0.4 &&
    (profile.laggingRoiTeams.includes(topTeam) ||
      profile.highWasteTeams.includes(topTeam))
  ) {
    const tools = profile.overlappingToolNames.join(" and ");
    insights.push(
      strategicInsight({
        id: "strategic-multisignal-coding-fragmentation",
        type: "trend",
        severity: profile.premiumDependencyRatio >= 0.55 ? "warning" : "info",
        category: "strategic",
        title: `${topTeam} shows premium coding fragmentation`,
        description: `${topTeam} appears over-provisioned on overlapping premium coding workflows (${tools}) while ROI and waste signals lag the org baseline—spend, tool overlap, and model tier concentration are moving together, not in isolation.`,
        whyThisMatters:
          "Fragmented premium coding stacks compound cost faster than productivity—this is an operating-model problem, not a single-tool tuning issue.",
        affectedEntity: topTeam,
        confidence: 0.84,
        recommendedAction:
          "Commission a workflow review with Engineering leadership: define a primary coding platform and model standards before the next expansion cycle.",
      }),
    );
  }

  if (
    profile.toolFragmentationScore >= 0.5 &&
    profile.governancePressure >= 0.35 &&
    profile.underutilizedToolCount >= 2
  ) {
    insights.push(
      strategicInsight({
        id: "strategic-multisignal-governance-sprawl",
        type: "risk",
        severity: "warning",
        category: "governance",
        title: "Tool sprawl is outpacing governance maturity",
        description: `The portfolio shows ${profile.underutilizedToolCount} underutilized tools, elevated waste (${Math.round(context.wasteRatio * 100)}%), and inconsistent ROI across teams—adoption breadth is scaling faster than ownership and standards.`,
        whyThisMatters:
          "Organizations in this pattern typically face a sharp finance review unless they demonstrate consolidation and measurable outcomes.",
        affectedEntity: "Organization",
        confidence: 0.81,
        recommendedAction:
          "Establish a cross-functional AI portfolio council with explicit tool approval criteria and quarterly utilization reviews.",
      }),
    );
  }

  if (
    profile.vendorConcentrationRatio >= 0.45 &&
    profile.premiumDependencyRatio >= 0.5 &&
    profile.adoptionIntensity >= 0.5
  ) {
    const topTool = [...context.byTool].sort((a, b) => b.spend - a.spend)[0];
    insights.push(
      strategicInsight({
        id: "strategic-multisignal-vendor-scaling",
        type: "trend",
        severity: "warning",
        category: "risk",
        title: "AI scaling is concentrating on a narrow vendor-model stack",
        description: `Spend is concentrating on ${topTool?.name ?? "primary vendors"} with heavy premium-model reliance (${Math.round(profile.premiumDependencyRatio * 100)}% of model spend)—adoption intensity is rising while the stack remains narrow.`,
        whyThisMatters:
          "Vendor and tier concentration creates negotiation blind spots and limits architectural optionality as usage scales.",
        affectedEntity: topTool?.name ?? "Organization",
        confidence: 0.79,
        recommendedAction:
          "Run a model evaluation pilot on representative workloads before renewing or expanding the dominant vendor footprint.",
      }),
    );
  }

  if (
    profile.laggingRoiTeams.length >= 2 &&
    profile.spendAnomalies.length > 0 &&
    !insights.some((i) => i.id === "strategic-multisignal-coding-fragmentation")
  ) {
    const teams = profile.laggingRoiTeams.slice(0, 2).join(" and ");
    insights.push(
      strategicInsight({
        id: "strategic-multisignal-spend-roi-divergence",
        type: "trend",
        severity: "warning",
        category: "financial",
        title: "Spend momentum is decoupling from ROI in key teams",
        description: `${teams} are trailing org ROI while spend acceleration signals appear in-period—cost is moving faster than proven value capture.`,
        whyThisMatters:
          "Decoupled spend and ROI trajectories are the earliest indicator of a portfolio that will fail executive scrutiny.",
        affectedEntity: profile.laggingRoiTeams[0],
        confidence: 0.77,
        recommendedAction:
          "Pause discretionary license expansion in lagging teams until workflow ROI is benchmarked against high-performing peers.",
      }),
    );
  }

  return insights.slice(0, 2);
}
