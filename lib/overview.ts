import { formatCurrency, formatCurrencyPrecise, formatNumber } from "@/lib/format";
import {
  calculateCPT,
  calculateEfficiencyScore,
  calculateROI,
  countUnderusedSeats,
  estimateCostSavingsOpportunity,
  getAverageSeatUtilization,
  getModelMismatchRate,
  getSpendOverTime,
  getSuccessRate,
  getToolSummaries,
  roundMoney,
  roundPercent,
  roundScore,
} from "@/lib/analytics";
import type {
  AnalyticsData,
  ChartInsightData,
  KpiCardData,
  KpiMetricId,
  OverviewPageData,
  ProviderSpendItem,
  RoiChartItem,
  UsageLog,
} from "@/lib/types";
import { getProviderKeyForToolId } from "@/lib/tool-registry";

function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return roundPercent(((current - previous) / previous) * 100);
}

function groupLogsByMonth(logs: UsageLog[]): Map<string, UsageLog[]> {
  const buckets = new Map<string, UsageLog[]>();
  for (const log of logs) {
    const month = log.date.slice(0, 7);
    const existing = buckets.get(month) ?? [];
    existing.push(log);
    buckets.set(month, existing);
  }
  return buckets;
}

function getSortedMonths(buckets: Map<string, UsageLog[]>): string[] {
  return [...buckets.keys()].sort((a, b) => a.localeCompare(b));
}

function computeMonthlyKpiValues(
  monthLogs: UsageLog[],
  byTool = getToolSummaries(monthLogs),
): Record<KpiMetricId, number> {
  const spend = roundMoney(monthLogs.reduce((sum, log) => sum + log.cost, 0));
  const hoursSaved = monthLogs.reduce(
    (sum, log) => sum + log.estimatedHoursSaved,
    0,
  );
  const successfulTasks = monthLogs.reduce(
    (sum, log) => sum + log.successfulTasks,
    0,
  );
  const roi = calculateROI(hoursSaved, spend);

  return {
    totalSpend: spend,
    roi,
    costSavingsOpportunity: estimateCostSavingsOpportunity(byTool),
    hoursSaved: roundScore(hoursSaved),
    cpt: calculateCPT(spend, successfulTasks),
    efficiencyScore: calculateEfficiencyScore(
      roi,
      getSuccessRate(monthLogs),
      1 - getModelMismatchRate(monthLogs),
      getAverageSeatUtilization(byTool),
    ),
    activeUsers: new Set(monthLogs.map((log) => log.user)).size,
    underusedSeats: countUnderusedSeats(byTool),
  };
}

function buildKpiTrends(logs: UsageLog[]): Record<KpiMetricId, number[]> {
  const buckets = groupLogsByMonth(logs);
  const months = getSortedMonths(buckets).slice(-6);
  const ids: KpiMetricId[] = [
    "totalSpend",
    "roi",
    "costSavingsOpportunity",
    "hoursSaved",
    "cpt",
    "efficiencyScore",
    "activeUsers",
    "underusedSeats",
  ];

  const trends = Object.fromEntries(
    ids.map((id) => [id, [] as number[]]),
  ) as Record<KpiMetricId, number[]>;

  for (const month of months) {
    const values = computeMonthlyKpiValues(buckets.get(month) ?? []);
    for (const id of ids) {
      trends[id].push(values[id]);
    }
  }

  return trends;
}

function buildKpiInsight(
  id: KpiMetricId,
  data: AnalyticsData,
): Pick<KpiCardData, "insightKey" | "insightParams"> {
  const { kpis, byTeam, byTool, anomalies, recommendations } = data;
  const topTeam = [...byTeam].sort((a, b) => b.roi - a.roi)[0];
  const lowestTeam = [...byTeam].sort((a, b) => a.roi - b.roi)[0];
  const topHoursTeam = [...byTeam].sort(
    (a, b) =>
      data.logs
        .filter((log) => log.team === b.name)
        .reduce((sum, log) => sum + log.estimatedHoursSaved, 0) -
      data.logs
        .filter((log) => log.team === a.name)
        .reduce((sum, log) => sum + log.estimatedHoursSaved, 0),
  )[0];
  const cursor = byTool.find((tool) => tool.id === "cursor");
  const slack = byTool.find((tool) => tool.id === "slack-ai");
  const primaryRec = recommendations[0];

  switch (id) {
    case "totalSpend":
      return {
        insightKey: "kpiInsights.totalSpend",
        insightParams: {
          spend: formatCurrency(kpis.totalSpend),
          toolCount: byTool.length,
          ...(anomalies[0]
            ? { anomalyId: anomalies[0].id, anomalyParams: anomalies[0].params }
            : {}),
        },
      };
    case "roi":
      return {
        insightKey: "kpiInsights.roi",
        insightParams: {
          roi: kpis.totalROI,
          team: topTeam?.name ?? "Engineering",
          teamRoi: topTeam?.roi ?? kpis.totalROI,
        },
      };
    case "costSavingsOpportunity":
      return {
        insightKey: "kpiInsights.costSavingsOpportunity",
        insightParams: {
          savings: formatCurrency(kpis.costSavingsOpportunity),
          seats: kpis.underusedSeats,
          action: primaryRec?.title ?? "Review seat assignments",
        },
      };
    case "hoursSaved":
      return {
        insightKey: "kpiInsights.hoursSaved",
        insightParams: {
          hours: formatNumber(kpis.hoursSaved),
          team: topHoursTeam?.name ?? "Engineering",
        },
      };
    case "cpt":
      return {
        insightKey: "kpiInsights.cpt",
        insightParams: {
          cpt: formatCurrencyPrecise(kpis.costPerSuccessfulTask),
          team: lowestTeam?.name ?? "Marketing",
        },
      };
    case "efficiencyScore":
      return {
        insightKey: "kpiInsights.efficiencyScore",
        insightParams: {
          score: kpis.efficiencyScore,
          topTeam: topTeam?.name ?? "Customer Success",
          topScore: topTeam?.efficiencyScore ?? kpis.efficiencyScore,
        },
      };
    case "activeUsers":
      return {
        insightKey: "kpiInsights.activeUsers",
        insightParams: {
          users: kpis.activeUsers,
          teams: byTeam.length,
        },
      };
    case "underusedSeats":
      return {
        insightKey: "kpiInsights.underusedSeats",
        insightParams: {
          seats: kpis.underusedSeats,
          cursorUnused: cursor
            ? Math.max(0, cursor.totalSeats - cursor.activeSeats)
            : 0,
          slackUtil: slack
            ? roundPercent(slack.seatUtilization * 100)
            : 0,
        },
      };
    default:
      return { insightKey: "kpiInsights.default", insightParams: {} };
  }
}

export function getKpiCards(data: AnalyticsData): KpiCardData[] {
  const trends = buildKpiTrends(data.logs);
  const latestMonth = getSortedMonths(groupLogsByMonth(data.logs)).at(-1);
  const previousMonth = getSortedMonths(groupLogsByMonth(data.logs)).at(-2);
  const latestLogs = latestMonth
    ? (groupLogsByMonth(data.logs).get(latestMonth) ?? data.logs)
    : data.logs;
  const previousLogs = previousMonth
    ? (groupLogsByMonth(data.logs).get(previousMonth) ?? [])
    : [];

  const latestValues = computeMonthlyKpiValues(latestLogs);
  const previousValues =
    previousLogs.length > 0
      ? computeMonthlyKpiValues(previousLogs)
      : latestValues;

  const definitions: Array<{
    id: KpiMetricId;
    format: KpiCardData["format"];
    lowerIsBetter: boolean;
    current: number;
  }> = [
    {
      id: "totalSpend",
      format: "currency",
      lowerIsBetter: false,
      current: data.kpis.totalSpend,
    },
    {
      id: "roi",
      format: "percent",
      lowerIsBetter: false,
      current: data.kpis.totalROI,
    },
    {
      id: "costSavingsOpportunity",
      format: "currency",
      lowerIsBetter: false,
      current: data.kpis.costSavingsOpportunity,
    },
    {
      id: "hoursSaved",
      format: "number",
      lowerIsBetter: false,
      current: data.kpis.hoursSaved,
    },
    {
      id: "cpt",
      format: "currency",
      lowerIsBetter: true,
      current: data.kpis.costPerSuccessfulTask,
    },
    {
      id: "efficiencyScore",
      format: "score",
      lowerIsBetter: false,
      current: data.kpis.efficiencyScore,
    },
    {
      id: "activeUsers",
      format: "number",
      lowerIsBetter: false,
      current: data.kpis.activeUsers,
    },
    {
      id: "underusedSeats",
      format: "number",
      lowerIsBetter: true,
      current: data.kpis.underusedSeats,
    },
  ];

  return definitions.map(({ id, format, lowerIsBetter, current }) => {
    const insight = buildKpiInsight(id, data);
    const trend =
      trends[id].length > 0 ? trends[id] : [current * 0.9, current];
    return {
      id,
      value: current,
      changePercent: percentChange(latestValues[id], previousValues[id]),
      trend,
      format,
      lowerIsBetter,
      ...insight,
    };
  });
}

export function getRoiByTeamChart(data: AnalyticsData): RoiChartItem[] {
  return [...data.byTeam]
    .sort((a, b) => b.roi - a.roi)
    .map((team) => ({ name: team.name, roi: team.roi }));
}

export function getRoiByToolChart(data: AnalyticsData): RoiChartItem[] {
  return [...data.byTool]
    .sort((a, b) => b.roi - a.roi)
    .map((tool) => ({ name: tool.name, roi: tool.roi }));
}

export function getSpendByProvider(data: AnalyticsData): ProviderSpendItem[] {
  const totals = new Map<string, number>();

  for (const tool of data.byTool) {
    const key = getProviderKeyForToolId(tool.id);
    totals.set(key, roundMoney((totals.get(key) ?? 0) + tool.spend));
  }

  return [...totals.entries()]
    .map(([providerKey, value]) => ({ providerKey, value }))
    .sort((a, b) => b.value - a.value);
}

export function getRoiByTeamInsight(data: AnalyticsData): ChartInsightData {
  const top = [...data.byTeam].sort((a, b) => b.roi - a.roi)[0];
  const expand = [...data.byTeam]
    .filter((team) => team.roi >= 250)
    .sort((a, b) => b.roi - a.roi)[1];

  return {
    insightKey: "chartInsights.roiByTeam",
    insightParams: {
      topTeam: top?.name ?? "Engineering",
      topRoi: top?.roi ?? 0,
      expandTeam: expand?.name ?? "Operations",
      expandRoi: expand?.roi ?? 0,
    },
  };
}

export function getRoiByToolInsight(data: AnalyticsData): ChartInsightData {
  const top = [...data.byTool].sort((a, b) => b.roi - a.roi)[0];
  const low = [...data.byTool].sort((a, b) => a.roi - b.roi)[0];
  const slack = data.byTool.find((tool) => tool.id === "slack-ai");

  return {
    insightKey: "chartInsights.roiByTool",
    insightParams: {
      topTool: top?.name ?? "GitHub Copilot",
      topRoi: top?.roi ?? 0,
      lowTool: low?.name ?? "Slack AI",
      lowRoi: low?.roi ?? 0,
      slackUtil: slack ? roundPercent(slack.seatUtilization * 100) : 0,
    },
  };
}

export function getOverviewPageData(data: AnalyticsData): OverviewPageData {
  return {
    period: data.period,
    kpis: getKpiCards(data),
    roiByTeam: getRoiByTeamChart(data),
    roiByTeamInsight: getRoiByTeamInsight(data),
    roiByTool: getRoiByToolChart(data),
    roiByToolInsight: getRoiByToolInsight(data),
    spendByProvider: getSpendByProvider(data),
    spendOverTime: getSpendOverTime(data.logs),
  };
}
