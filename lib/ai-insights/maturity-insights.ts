import type { AIInsight } from "@/lib/types";

import type { OrganizationalSignalProfile } from "@/lib/ai-insights/signal-profile";

export type MaturityDimension =
  | "experimentation"
  | "standardization"
  | "dependence"
  | "governance"
  | "adoption-consistency";

export interface MaturityAssessment {
  dimension: MaturityDimension;
  level: "emerging" | "developing" | "mature" | "at-risk";
  headline: string;
  narrative: string;
}

function assessMaturity(
  profile: OrganizationalSignalProfile,
): MaturityAssessment[] {
  const assessments: MaturityAssessment[] = [];

  if (profile.experimentationScore >= 0.55 && profile.standardizationGap < 0.45) {
    assessments.push({
      dimension: "experimentation",
      level: "mature",
      headline: "Strong experimentation culture",
      narrative:
        "Teams are exploring a broad tool and model surface area with relatively controlled ROI dispersion—innovation is active without runaway fragmentation.",
    });
  } else if (profile.experimentationScore >= 0.5 && profile.standardizationGap >= 0.45) {
    assessments.push({
      dimension: "experimentation",
      level: "at-risk",
      headline: "High experimentation without standardization guardrails",
      narrative:
        "The organization is testing widely across tools and models, but weak standardization means experiments are not converting into durable operating practices.",
    });
  }

  if (profile.standardizationGap >= 0.5) {
    assessments.push({
      dimension: "standardization",
      level: "emerging",
      headline: "Weak standardization maturity",
      narrative:
        "ROI variance across teams and overlapping tool footprints suggest AI practices are team-specific rather than organizationally codified.",
    });
  } else if (profile.standardizationGap <= 0.3) {
    assessments.push({
      dimension: "standardization",
      level: "developing",
      headline: "Standardization is taking hold",
      narrative:
        "Cross-team ROI and tooling patterns are converging—signals point toward repeatable AI operating norms rather than isolated experiments.",
    });
  }

  if (
    profile.premiumDependencyRatio >= 0.5 &&
    profile.adoptionIntensity >= 0.55
  ) {
    assessments.push({
      dimension: "dependence",
      level: "at-risk",
      headline: "Growing AI dependence on premium tiers",
      narrative:
        "Adoption intensity and premium-model concentration are rising together—the organization is becoming operationally dependent on high-cost capability before governance catches up.",
    });
  }

  if (profile.governancePressure >= 0.4) {
    assessments.push({
      dimension: "governance",
      level: "emerging",
      headline: "Fragmented governance maturity",
      narrative:
        "Waste, underutilized seats, and portfolio sprawl indicate governance is reactive—policies and ownership have not kept pace with adoption velocity.",
    });
  }

  if (profile.roiDispersion >= 50 && profile.laggingRoiTeams.length >= 2) {
    assessments.push({
      dimension: "adoption-consistency",
      level: "at-risk",
      headline: "Inconsistent adoption maturity across teams",
      narrative:
        "Some teams capture strong ROI while others lag significantly—AI capability is uneven, which limits enterprise-wide leverage of shared platforms.",
    });
  } else if (profile.adoptionIntensity >= 0.6 && profile.roiDispersion < 35) {
    assessments.push({
      dimension: "adoption-consistency",
      level: "mature",
      headline: "Consistent adoption with measurable outcomes",
      narrative:
        "Active usage is broad and ROI dispersion is contained—adoption appears disciplined rather than experimental-only.",
    });
  }

  return assessments.slice(0, 2);
}

export function generateMaturityInsights(
  profile: OrganizationalSignalProfile,
): AIInsight[] {
  return assessMaturity(profile).map((assessment) => ({
    id: `strategic-maturity-${assessment.dimension}`,
    type: "trend" as const,
    severity: assessment.level === "at-risk" ? "warning" as const : "info" as const,
    category: "strategic" as const,
    priority: assessment.level === "at-risk" ? "high" as const : "medium" as const,
    title: assessment.headline,
    description: assessment.narrative,
    whyThisMatters:
      "AI maturity determines whether spend scales into durable capability or recurring waste—leadership needs a clear read on where the org sits on the maturity curve.",
    affectedEntity: "Organization",
    confidence: assessment.level === "at-risk" ? 0.8 : 0.72,
    recommendedAction:
      assessment.dimension === "governance"
        ? "Prioritize an AI operating model workshop: define ownership, approval paths, and model standards before the next budget cycle."
        : assessment.dimension === "standardization"
          ? "Sponsor a cross-team playbook for model selection and tool ownership—move from team experiments to shared standards."
          : "Align executive sponsors on whether to optimize for experimentation speed or consolidation—and resource accordingly.",
  }));
}
