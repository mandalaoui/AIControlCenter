import type { AIInsight, DashboardContext } from "@/lib/types";

import { generateMaturityInsights } from "@/lib/ai-insights/maturity-insights";
import { generateMultiSignalInsights } from "@/lib/ai-insights/multi-signal-reasoning";
import { buildOrganizationalSignalProfile } from "@/lib/ai-insights/signal-profile";
import { generateStrategicRiskInsights } from "@/lib/ai-insights/strategic-risks";
import { generateWhatChangedInsights } from "@/lib/ai-insights/what-changed";
import {
  assignPriority,
  deduplicateInsightIds,
} from "@/lib/ai-insights/priorities";
import { assignCategory } from "@/lib/ai-insights/categories";

/**
 * Head-of-AI-Ops strategic layer: maturity, multi-signal synthesis,
 * strategic risks, and what-changed reasoning.
 */
export function generateStrategicInsights(
  context: DashboardContext,
): AIInsight[] {
  const profile = buildOrganizationalSignalProfile(context);

  const raw: AIInsight[] = [
    ...generateMultiSignalInsights(context, profile),
    ...generateMaturityInsights(profile),
    ...generateStrategicRiskInsights(context, profile),
    ...generateWhatChangedInsights(context, profile),
  ];

  return deduplicateInsightIds(
    raw.map((insight) =>
      assignPriority(assignCategory(insight), context),
    ),
  );
}

export { buildOrganizationalSignalProfile } from "@/lib/ai-insights/signal-profile";
