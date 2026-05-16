import { calculateRecommendationConfidence } from "./confidence";
import { roundMoney, roundPercent, roundScore } from "./math";
import { getToolIdForName } from "@/lib/tool-registry";
import type {
  OptimizationRecommendation,
  OverlapSummary,
  Team,
  Tool,
  UsageLog,
  UsageType,
} from "@/lib/types";

/** Minimum overlap score to surface a recommendation. */
export const OVERLAP_SCORE_THRESHOLD = 0.45;

/** Each tool in a pair must meet these usage floors. */
export const MIN_TOOL_SPEND = 100;
export const MIN_TOOL_ACTIVE_USERS = 2;

/** Shared-user and savings floors. */
export const MIN_SHARED_USERS = 3;
export const MIN_OVERLAPPING_SPEND = 500;
export const MIN_ESTIMATED_SAVINGS = 50;

export const SAVINGS_RATE_MIN = 0.05;
export const SAVINGS_RATE_MAX = 0.2;

const MAX_OVERLAP_RECOMMENDATIONS = 5;

/** Pairs commonly used for the same workflow class. */
const KNOWN_WORKFLOW_OVERLAPS: Array<{
  tools: [Tool, Tool];
  usageTypes: UsageType[];
}> = [
  { tools: ["Cursor", "GitHub Copilot"], usageTypes: ["coding"] },
  {
    tools: ["OpenAI API", "Anthropic API"],
    usageTypes: ["coding", "research", "analysis", "content", "automation"],
  },
  {
    tools: ["Microsoft Copilot", "OpenAI API"],
    usageTypes: ["content", "research", "analysis"],
  },
];

interface SegmentToolMetrics {
  users: Set<string>;
  spend: number;
  requests: number;
  logCount: number;
}

type SegmentKey = `${Team}|${UsageType}`;

function segmentKey(team: Team, usageType: UsageType): SegmentKey {
  return `${team}|${usageType}`;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function toolsMatchPair(
  toolA: Tool,
  toolB: Tool,
  pair: [Tool, Tool],
): boolean {
  return (
    (toolA === pair[0] && toolB === pair[1]) ||
    (toolA === pair[1] && toolB === pair[0])
  );
}

function isKnownWorkflowPair(
  toolA: Tool,
  toolB: Tool,
  usageType: UsageType,
): boolean {
  return KNOWN_WORKFLOW_OVERLAPS.some(
    (entry) =>
      entry.usageTypes.includes(usageType) &&
      toolsMatchPair(toolA, toolB, entry.tools),
  );
}

function buildSegmentMetrics(
  logs: UsageLog[],
): Map<SegmentKey, Map<Tool, SegmentToolMetrics>> {
  const segments = new Map<SegmentKey, Map<Tool, SegmentToolMetrics>>();

  for (const log of logs) {
    const key = segmentKey(log.team, log.usageType);
    if (!segments.has(key)) {
      segments.set(key, new Map());
    }
    const toolMap = segments.get(key)!;
    if (!toolMap.has(log.tool)) {
      toolMap.set(log.tool, {
        users: new Set(),
        spend: 0,
        requests: 0,
        logCount: 0,
      });
    }
    const metrics = toolMap.get(log.tool)!;
    metrics.users.add(log.user);
    metrics.spend += log.cost;
    metrics.requests += log.requests;
    metrics.logCount += 1;
  }

  return segments;
}

function userOverlapRatio(
  usersA: Set<string>,
  usersB: Set<string>,
): number {
  if (usersA.size === 0 || usersB.size === 0) {
    return 0;
  }

  let shared = 0;
  for (const user of usersA) {
    if (usersB.has(user)) {
      shared += 1;
    }
  }

  return shared / Math.min(usersA.size, usersB.size);
}

function spendAllocationSimilarity(spendA: number, spendB: number): number {
  if (spendA <= 0 || spendB <= 0) {
    return 0;
  }
  return Math.min(spendA, spendB) / Math.max(spendA, spendB);
}

function requestPatternSimilarity(
  metricsA: SegmentToolMetrics,
  metricsB: SegmentToolMetrics,
): number {
  const avgA =
    metricsA.users.size > 0
      ? metricsA.requests / metricsA.users.size
      : 0;
  const avgB =
    metricsB.users.size > 0
      ? metricsB.requests / metricsB.users.size
      : 0;

  if (avgA <= 0 || avgB <= 0) {
    return 0;
  }

  return Math.min(avgA, avgB) / Math.max(avgA, avgB);
}

function countSharedUsers(
  usersA: Set<string>,
  usersB: Set<string>,
): number {
  let shared = 0;
  for (const user of usersA) {
    if (usersB.has(user)) {
      shared += 1;
    }
  }
  return shared;
}

/**
 * Deterministic overlap score in [0, 1] from telemetry signals.
 */
export function calculateOverlapScore(
  metricsA: SegmentToolMetrics,
  metricsB: SegmentToolMetrics,
  usageType: UsageType,
  toolA: Tool,
  toolB: Tool,
): number {
  const userOverlap = userOverlapRatio(metricsA.users, metricsB.users);
  const spendSimilarity = spendAllocationSimilarity(
    metricsA.spend,
    metricsB.spend,
  );
  const requestSimilarity = requestPatternSimilarity(metricsA, metricsB);
  const workflowBonus = isKnownWorkflowPair(toolA, toolB, usageType)
    ? 1
    : 0.5;

  const score =
    userOverlap * 0.35 +
    spendSimilarity * 0.2 +
    requestSimilarity * 0.15 +
    workflowBonus * 0.15 +
    Math.min(1, (metricsA.logCount + metricsB.logCount) / 40) * 0.15;

  return roundScore(clamp01(score));
}

function overlappingSpend(spendA: number, spendB: number): number {
  return roundMoney(Math.min(spendA, spendB));
}

function estimateOverlapSavings(
  overlapScore: number,
  spendA: number,
  spendB: number,
): number {
  const base = overlappingSpend(spendA, spendB);
  const rate =
    SAVINGS_RATE_MIN +
    (overlapScore - OVERLAP_SCORE_THRESHOLD) *
      ((SAVINGS_RATE_MAX - SAVINGS_RATE_MIN) /
        (1 - OVERLAP_SCORE_THRESHOLD));

  const clampedRate = Math.max(
    SAVINGS_RATE_MIN,
    Math.min(SAVINGS_RATE_MAX, rate),
  );

  return roundMoney(base * clampedRate);
}

function hasRealUsage(metrics: SegmentToolMetrics): boolean {
  return (
    metrics.spend >= MIN_TOOL_SPEND &&
    metrics.users.size >= MIN_TOOL_ACTIVE_USERS
  );
}

function buildOverlapEvidence(
  team: Team,
  toolA: Tool,
  toolB: Tool,
  usageType: UsageType,
  sharedUsers: number,
  userOverlapPct: number,
  overlappingSpendAmount: number,
  requestsA: number,
  requestsB: number,
): string {
  return (
    `${team} logged ${sharedUsers} active users on both ${toolA} and ${toolB} ` +
    `for ${usageType} workflows (${roundPercent(userOverlapPct)}% user overlap, ` +
    `$${overlappingSpendAmount.toLocaleString()} overlapping spend, ` +
    `${requestsA.toLocaleString()} vs ${requestsB.toLocaleString()} requests).`
  );
}

/**
 * Detect tool pairs with overlapping workflows within the same team segment.
 */
export function detectToolOverlaps(logs: UsageLog[]): OverlapSummary[] {
  const segments = buildSegmentMetrics(logs);
  const overlaps: OverlapSummary[] = [];

  for (const [key, toolMap] of segments) {
    const [team, usageType] = key.split("|") as [Team, UsageType];
    const tools = [...toolMap.keys()];

    for (let i = 0; i < tools.length; i += 1) {
      for (let j = i + 1; j < tools.length; j += 1) {
        const toolA = tools[i];
        const toolB = tools[j];
        const metricsA = toolMap.get(toolA)!;
        const metricsB = toolMap.get(toolB)!;

        if (!hasRealUsage(metricsA) || !hasRealUsage(metricsB)) {
          continue;
        }

        const sharedUsers = countSharedUsers(
          metricsA.users,
          metricsB.users,
        );
        if (sharedUsers < MIN_SHARED_USERS) {
          continue;
        }

        const overlapScore = calculateOverlapScore(
          metricsA,
          metricsB,
          usageType,
          toolA,
          toolB,
        );

        if (overlapScore < OVERLAP_SCORE_THRESHOLD) {
          continue;
        }

        const overlapSpend = overlappingSpend(
          metricsA.spend,
          metricsB.spend,
        );
        if (overlapSpend < MIN_OVERLAPPING_SPEND) {
          continue;
        }

        const estimatedSavings = estimateOverlapSavings(
          overlapScore,
          metricsA.spend,
          metricsB.spend,
        );
        if (estimatedSavings < MIN_ESTIMATED_SAVINGS) {
          continue;
        }

        const spendSimilarity = spendAllocationSimilarity(
          metricsA.spend,
          metricsB.spend,
        );
        const userOverlapPct = userOverlapRatio(
          metricsA.users,
          metricsB.users,
        ) * 100;

        overlaps.push({
          tools: [toolA, toolB],
          team,
          usageType,
          overlapScore,
          estimatedSavings,
          sharedUsers,
          overlappingSpend: overlapSpend,
          spendSimilarity,
          evidence: buildOverlapEvidence(
            team,
            toolA,
            toolB,
            usageType,
            sharedUsers,
            userOverlapPct,
            overlapSpend,
            metricsA.requests,
            metricsB.requests,
          ),
        });
      }
    }
  }

  return overlaps.sort((a, b) => b.overlapScore - a.overlapScore);
}

function overlapRecommendationId(
  team: Team,
  usageType: UsageType,
  toolA: Tool,
  toolB: Tool,
): string {
  const idA = getToolIdForName(toolA) ?? toolA.toLowerCase().replace(/\s+/g, "-");
  const idB = getToolIdForName(toolB) ?? toolB.toLowerCase().replace(/\s+/g, "-");
  const [first, second] = [idA, idB].sort();
  const teamSlug = team.toLowerCase().replace(/\s+/g, "-");
  return `rec-overlap-${teamSlug}-${usageType}-${first}-${second}`;
}

function workflowLabel(usageType: UsageType): string {
  const labels: Record<UsageType, string> = {
    coding: "coding",
    research: "research",
    content: "content generation",
    support: "customer support",
    automation: "automation",
    analysis: "data analysis",
  };
  return labels[usageType];
}

/**
 * Build actionable consolidation recommendations from overlap summaries.
 */
export function generateOverlapRecommendations(
  overlaps: OverlapSummary[],
): OptimizationRecommendation[] {
  return overlaps.slice(0, MAX_OVERLAP_RECOMMENDATIONS).map((overlap) => {
    const [toolA, toolB] = overlap.tools;
    const workflow = workflowLabel(overlap.usageType);

    return {
      id: overlapRecommendationId(overlap.team, overlap.usageType, toolA, toolB),
      title: `Consolidate overlapping ${workflow} tools for ${overlap.team}`,
      description:
        `${overlap.team} uses both ${toolA} and ${toolB} for similar ${workflow} workflows. ` +
        `Consolidating to a single primary tool could reduce duplicated subscription and API spend.`,
      evidence: overlap.evidence,
      riskLevel: "medium" as const,
      confidence: calculateRecommendationConfidence({
        sampleSize: overlap.sharedUsers,
        signalStrength: overlap.overlapScore,
        consistency: overlap.spendSimilarity,
        severity: Math.min(
          1,
          overlap.estimatedSavings /
            Math.max(overlap.overlappingSpend * SAVINGS_RATE_MAX, 1),
        ),
      }),
      estimatedMonthlySavings: overlap.estimatedSavings,
      category: "tool-consolidation" as const,
      i18nParams: {
        team: overlap.team,
        toolA,
        toolB,
        usageType: overlap.usageType,
        overlapScore: overlap.overlapScore,
      },
    };
  });
}
