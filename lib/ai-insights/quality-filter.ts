import type { AIInsight, DashboardContext } from "@/lib/types";

const GENERIC_PATTERNS = [
  /^total spend is/i,
  /^organization ai spend/i,
  /^the organization has/i,
  /^it is important to note/i,
  /^this insight suggests/i,
  /^there is a need to/i,
  /monitor closely and consider/i,
  /^based on the data/i,
  /^the data shows/i,
];

const UNRESOLVED_TEMPLATE = /\{\{[^}]+\}\}|<[A-Z_]+>|\[INSERT[^\]]*\]/i;

function hasUnresolvedTemplate(insight: AIInsight): boolean {
  const combined = [
    insight.title,
    insight.description,
    insight.recommendedAction,
    insight.affectedEntity,
    insight.whyThisMatters ?? "",
  ].join(" ");
  return UNRESOLVED_TEMPLATE.test(combined);
}

const KPI_ONLY_PATTERNS = [
  /^roi is \d+%/i,
  /^spend is \$/i,
  /with \d+% roi and \d+ active users/i,
];

const ROBOTIC_REPLACEMENTS: [RegExp, string][] = [
  [/it is recommended that/gi, ""],
  [/additionally,/gi, ""],
  [/in conclusion,/gi, ""],
  [/it should be noted that/gi, ""],
  [/going forward,/gi, ""],
  [/\s{2,}/g, " "],
];

function normalizeKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 8)
    .join(" ");
}

export function polishExecutiveTone(text: string): string {
  let result = text.trim();
  for (const [pattern, replacement] of ROBOTIC_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result.trim();
}

function isLowValueInsight(insight: AIInsight): boolean {
  if (hasUnresolvedTemplate(insight)) return true;
  const combined = `${insight.title} ${insight.description}`;
  if (GENERIC_PATTERNS.some((p) => p.test(combined))) return true;
  if (
    KPI_ONLY_PATTERNS.some((p) => p.test(insight.description.trim())) &&
    insight.description.length < 120
  ) {
    return true;
  }
  if (insight.description.split(/\s+/).length < 12) return true;
  return false;
}

function similarityScore(a: string, b: string): number {
  const wordsA = new Set(normalizeKey(a).split(" "));
  const wordsB = new Set(normalizeKey(b).split(" "));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }
  return overlap / Math.max(wordsA.size, wordsB.size);
}

function dedupeSimilarInsights(insights: AIInsight[]): AIInsight[] {
  const kept: AIInsight[] = [];

  for (const insight of insights) {
    const isDuplicate = kept.some((existing) => {
      const titleSim = similarityScore(existing.title, insight.title);
      const descSim = similarityScore(existing.description, insight.description);
      const sameEntity =
        existing.affectedEntity.toLowerCase() ===
        insight.affectedEntity.toLowerCase();
      return (
        (titleSim >= 0.65 && sameEntity) ||
        (descSim >= 0.7 && sameEntity) ||
        existing.id === insight.id
      );
    });

    if (!isDuplicate) {
      kept.push(insight);
    } else if (insight.id.startsWith("strategic-")) {
      const idx = kept.findIndex(
        (e) =>
          similarityScore(e.title, insight.title) >= 0.65 &&
          e.affectedEntity.toLowerCase() === insight.affectedEntity.toLowerCase(),
      );
      if (idx >= 0 && !kept[idx].id.startsWith("strategic-")) {
        kept[idx] = insight;
      }
    }
  }

  return kept;
}

function polishInsight(insight: AIInsight): AIInsight {
  return {
    ...insight,
    title: polishExecutiveTone(insight.title),
    description: polishExecutiveTone(insight.description),
    whyThisMatters: polishExecutiveTone(insight.whyThisMatters),
    recommendedAction: polishExecutiveTone(insight.recommendedAction),
  };
}

/**
 * Removes filler, deduplicates similar narratives, and polishes executive tone.
 * Prefers strategic-* insights when conflicts arise.
 */
export function filterInsightQuality(
  insights: AIInsight[],
  _context: DashboardContext,
  maxInsights = 8,
): AIInsight[] {
  const filtered = insights.filter((i) => !isLowValueInsight(i));

  const deduped = dedupeSimilarInsights(filtered).map(polishInsight);

  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  return deduped
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, maxInsights);
}
