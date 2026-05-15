import mockLogs from "@/data/mock_logs.json";
import mockMetrics from "@/data/mock_metrics.json";
import type {
  AICategorizationResult,
  AnalyticsData,
  AnalyticsKpis,
  AnomalySummary,
  CategorizedUsageLog,
  CostAnalyticsFilters,
  CostBreakdownRow,
  DashboardContext,
  LowProductivityUser,
  Model,
  ModelSummary,
  ModelUsageRow,
  OptimizationRecommendation,
  RoiEfficiencyMetrics,
  Team,
  TeamDetailCard,
  TeamSummary,
  Tool,
  ToolComparisonRow,
  ToolSummary,
  UsageLog,
  UserSpendSummary,
} from "@/lib/types";

const HOURLY_RATE = 75;
const LOW_ROI_THRESHOLD = 50;
const COMPLEXITY_MISMATCH_THRESHOLD = 4;

const HIGH_COMPLEXITY_MODELS: Model[] = [
  "Claude Opus",
  "GPT-4",
  "Gemini Ultra",
];

const SEAT_BASED_TOOLS: Partial<Record<Tool, number>> = {
  Cursor: 52,
  "GitHub Copilot": 60,
  "Microsoft Copilot": 55,
  "Slack AI": 50,
};

const SEAT_MONTHLY_COST: Partial<Record<Tool, number>> = {
  Cursor: 32,
  "GitHub Copilot": 19,
  "Microsoft Copilot": 30,
  "Slack AI": 12,
};

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

export function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function loadUsageLogs(): UsageLog[] {
  return mockLogs as UsageLog[];
}

export function calculateROI(
  estimatedHoursSaved: number,
  cost: number,
): number {
  if (cost <= 0) {
    return 0;
  }
  return roundPercent(
    ((estimatedHoursSaved * HOURLY_RATE - cost) / cost) * 100,
  );
}

export function calculateCPT(cost: number, successfulTasks: number): number {
  if (successfulTasks <= 0) {
    return 0;
  }
  return roundMoney(cost / successfulTasks);
}

export function getModelMismatchRate(logs: UsageLog[]): number {
  if (logs.length === 0) {
    return 0;
  }
  const mismatches = logs.filter(
    (log) =>
      HIGH_COMPLEXITY_MODELS.includes(log.model) &&
      log.complexityScore < COMPLEXITY_MISMATCH_THRESHOLD,
  ).length;
  return roundPercent((mismatches / logs.length) * 100) / 100;
}

export function getSuccessRate(logs: UsageLog[]): number {
  const totalTasks = logs.reduce((sum, log) => sum + log.totalTasks, 0);
  const successfulTasks = logs.reduce(
    (sum, log) => sum + log.successfulTasks,
    0,
  );
  if (totalTasks === 0) {
    return 0;
  }
  return successfulTasks / totalTasks;
}

export function getAverageSeatUtilization(toolSummaries: ToolSummary[]): number {
  const seatTools = toolSummaries.filter((tool) => tool.totalSeats > 0);
  if (seatTools.length === 0) {
    return 1;
  }
  return (
    seatTools.reduce((sum, tool) => sum + tool.seatUtilization, 0) /
    seatTools.length
  );
}

export function calculateEfficiencyScore(
  roi: number,
  successRate: number,
  modelFitScore: number,
  seatUtilization: number,
): number {
  const roiScore = Math.min(roi / 500, 1) * 40;
  const successScore = successRate * 30;
  const modelFitComponent = modelFitScore * 20;
  const seatScore = seatUtilization * 10;
  return roundScore(
    Math.min(100, roiScore + successScore + modelFitComponent + seatScore),
  );
}

export function calculateWasteRatio(logs: UsageLog[]): number {
  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
  if (totalCost === 0) {
    return 0;
  }
  const wasteCost = logs
    .filter(
      (log) =>
        calculateROI(log.estimatedHoursSaved, log.cost) < LOW_ROI_THRESHOLD,
    )
    .reduce((sum, log) => sum + log.cost, 0);
  return roundMoney(wasteCost / totalCost);
}

function getIsoWeek(dateString: string): string {
  const date = new Date(dateString);
  const target = new Date(date.valueOf());
  const dayNumber = (date.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNumber + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86_400_000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function getTeamSummaries(logs: UsageLog[]): TeamSummary[] {
  const teams = Array.from(new Set(logs.map((log) => log.team)));

  return teams.map((team) => {
    const teamLogs = logs.filter((log) => log.team === team);
    const spend = roundMoney(teamLogs.reduce((sum, log) => sum + log.cost, 0));
    const hoursSaved = teamLogs.reduce(
      (sum, log) => sum + log.estimatedHoursSaved,
      0,
    );
    const successfulTasks = teamLogs.reduce(
      (sum, log) => sum + log.successfulTasks,
      0,
    );
    const roi = calculateROI(hoursSaved, spend);
    const cpt = calculateCPT(spend, successfulTasks);
    const wasteRatio = calculateWasteRatio(teamLogs);
    const activeUsers = new Set(teamLogs.map((log) => log.user)).size;

    const toolSpend = new Map<Tool, number>();
    for (const log of teamLogs) {
      toolSpend.set(log.tool, (toolSpend.get(log.tool) ?? 0) + log.cost);
    }
    const topTool =
      [...toolSpend.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
      teamLogs[0]?.tool ??
      ("OpenAI API" as Tool);

    const modelFit = 1 - getModelMismatchRate(teamLogs);
    const efficiencyScore = calculateEfficiencyScore(
      roi,
      getSuccessRate(teamLogs),
      modelFit,
      1,
    );

    return {
      name: team,
      spend,
      roi,
      cpt,
      efficiencyScore,
      topTool,
      activeUsers,
      wasteRatio,
    };
  });
}

export function getToolSummaries(logs: UsageLog[]): ToolSummary[] {
  const tools = Array.from(new Set(logs.map((log) => log.tool)));

  return tools.map((tool) => {
    const toolLogs = logs.filter((log) => log.tool === tool);
    const spend = roundMoney(toolLogs.reduce((sum, log) => sum + log.cost, 0));
    const hoursSaved = toolLogs.reduce(
      (sum, log) => sum + log.estimatedHoursSaved,
      0,
    );
    const roi = calculateROI(hoursSaved, spend);
    const activeSeats = new Set(toolLogs.map((log) => log.user)).size;
    const totalSeats = SEAT_BASED_TOOLS[tool] ?? 0;
    const seatUtilization =
      totalSeats > 0
        ? roundMoney(activeSeats / totalSeats)
        : activeSeats > 0
          ? 1
          : 0;

    return {
      name: tool,
      spend,
      roi,
      seatUtilization,
      activeSeats,
      totalSeats,
    };
  });
}

export function getModelFitAnalysis(logs: UsageLog[]): ModelSummary[] {
  const models = Array.from(new Set(logs.map((log) => log.model)));

  return models.map((model) => {
    const modelLogs = logs.filter((log) => log.model === model);
    const spend = roundMoney(
      modelLogs.reduce((sum, log) => sum + log.cost, 0),
    );
    const avgComplexityScore =
      modelLogs.length === 0
        ? 0
        : roundScore(
            modelLogs.reduce((sum, log) => sum + log.complexityScore, 0) /
              modelLogs.length,
          );
    const mismatchRate = getModelMismatchRate(modelLogs);

    return {
      name: model,
      spend,
      avgComplexityScore,
      mismatchRate,
    };
  });
}

export function detectAnomalies(
  logs: UsageLog[],
  byTeam: TeamSummary[],
  byTool: ToolSummary[],
  byModel: ModelSummary[],
): AnomalySummary[] {
  const anomalies: AnomalySummary[] = [];

  const weeklyTeamSpend = new Map<string, number>();
  for (const log of logs) {
    const key = `${log.team}|${getIsoWeek(log.date)}`;
    weeklyTeamSpend.set(key, (weeklyTeamSpend.get(key) ?? 0) + log.cost);
  }

  const teamBaselines = new Map<Team, number>();
  for (const team of byTeam) {
    const weeks = [...weeklyTeamSpend.entries()]
      .filter(([key]) => key.startsWith(`${team.name}|`))
      .map(([, spend]) => spend);
    if (weeks.length > 0) {
      teamBaselines.set(
        team.name,
        weeks.reduce((sum, value) => sum + value, 0) / weeks.length,
      );
    }
  }

  for (const [key, spend] of weeklyTeamSpend) {
    const [teamName, week] = key.split("|") as [Team, string];
    const baseline = teamBaselines.get(teamName) ?? 0;
    if (baseline > 0 && spend >= baseline * 2.5) {
      anomalies.push({
        description: `${teamName} API spend spiked during week ${week}, driven by high-volume premium model calls`,
        magnitude: `${roundPercent((spend / baseline) * 100) / 100}x above baseline`,
        affectedEntity: teamName,
        week,
      });
    }
  }

  for (const tool of byTool) {
    if (tool.totalSeats > 0 && tool.seatUtilization < 0.3) {
      const inactive = tool.totalSeats - tool.activeSeats;
      anomalies.push({
        description: `${tool.name} has ${roundPercent(tool.seatUtilization * 100)}% seat utilization — ${inactive} of ${tool.totalSeats} configured seats show limited activity`,
        magnitude: `${roundPercent((1 - tool.seatUtilization) * 100)}% seats inactive`,
        affectedEntity: tool.name,
        week: getIsoWeek(logs[logs.length - 1]?.date ?? new Date().toISOString()),
      });
    }
  }

  const lowestRoiTeam = [...byTeam].sort((a, b) => a.roi - b.roi)[0];
  if (lowestRoiTeam && lowestRoiTeam.roi < 100) {
    anomalies.push({
      description: `${lowestRoiTeam.name} ROI is ${lowestRoiTeam.roi}% — spend is high relative to hours saved`,
      magnitude: "Lowest team ROI",
      affectedEntity: lowestRoiTeam.name,
      week: getIsoWeek(logs[logs.length - 1]?.date ?? new Date().toISOString()),
    });
  }

  const opus = byModel.find((model) => model.name === "Claude Opus");
  if (opus && opus.mismatchRate > 0.3) {
    anomalies.push({
      description: `Claude Opus mismatch rate at ${roundPercent(opus.mismatchRate * 100)}% — many Engineering calls use Opus on low-complexity tasks`,
      magnitude: `${roundPercent(opus.mismatchRate * 100)}% mismatch rate`,
      affectedEntity: "Claude Opus",
      week: getIsoWeek(logs[logs.length - 1]?.date ?? new Date().toISOString()),
    });
  }

  return anomalies.slice(0, 6);
}

function getUserSummaries(logs: UsageLog[]): UserSpendSummary[] {
  const users = Array.from(new Set(logs.map((log) => log.user)));

  return users.map((user) => {
    const userLogs = logs.filter((log) => log.user === user);
    const spend = roundMoney(userLogs.reduce((sum, log) => sum + log.cost, 0));
    const hoursSaved = userLogs.reduce(
      (sum, log) => sum + log.estimatedHoursSaved,
      0,
    );
    const roi = calculateROI(hoursSaved, spend);

    const toolSpend = new Map<Tool, number>();
    for (const log of userLogs) {
      toolSpend.set(log.tool, (toolSpend.get(log.tool) ?? 0) + log.cost);
    }
    const primaryTool =
      [...toolSpend.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
      userLogs[0]?.tool ??
      ("OpenAI API" as Tool);

    return {
      user,
      team: userLogs[0]?.team ?? ("Engineering" as Team),
      spend,
      roi,
      primaryTool,
    };
  });
}

function getLowProductivityUsers(logs: UsageLog[]): LowProductivityUser[] {
  return getUserSummaries(logs)
    .filter((user) => user.roi < 100)
    .sort((a, b) => a.roi - b.roi)
    .slice(0, 10)
    .map((user) => ({
      user: user.user,
      team: user.team,
      spend: user.spend,
      roi: user.roi,
      issue:
        user.roi < 50
          ? "high cost, low hours saved"
          : "low task success rate",
    }));
}

export function estimateCostSavingsOpportunity(byTool: ToolSummary[]): number {
  let savings = 0;

  for (const tool of byTool) {
    if (tool.totalSeats > 0) {
      const unused = Math.max(0, tool.totalSeats - tool.activeSeats);
      const seatCost = SEAT_MONTHLY_COST[tool.name] ?? 20;
      savings += unused * seatCost;
    }
  }

  return roundMoney(savings);
}

export function countUnderusedSeats(byTool: ToolSummary[]): number {
  return byTool.reduce((sum, tool) => {
    if (tool.totalSeats === 0) {
      return sum;
    }
    return sum + Math.max(0, tool.totalSeats - tool.activeSeats);
  }, 0);
}

export function getOptimizationRecommendations(
  data: Pick<
    AnalyticsData,
    "byTeam" | "byTool" | "byModel" | "kpis" | "anomalies"
  >,
): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];

  const cursor = data.byTool.find((tool) => tool.name === "Cursor");
  if (cursor && cursor.totalSeats > 0) {
    const unused = cursor.totalSeats - cursor.activeSeats;
    if (unused >= 10) {
      recommendations.push({
        id: "rec-cursor-seats",
        title: "Reclaim inactive Cursor seats",
        description: `Reduce Cursor licenses by ${Math.min(12, unused)} seats where developers show no usage in the last 30 days.`,
        evidence: `${unused} of ${cursor.totalSeats} Cursor seats are inactive (${roundPercent(cursor.seatUtilization * 100)}% utilization).`,
        riskLevel: "low",
        confidence: 0.92,
        estimatedMonthlySavings: roundMoney(unused * (SEAT_MONTHLY_COST.Cursor ?? 32)),
        category: "seat-reduction",
      });
    }
  }

  const slack = data.byTool.find((tool) => tool.name === "Slack AI");
  if (slack && slack.seatUtilization < 0.3) {
    recommendations.push({
      id: "rec-slack-seats",
      title: "Right-size Slack AI licenses",
      description:
        "Audit Slack AI seat assignments and remove licenses for teams with zero activity.",
      evidence: `Slack AI seat utilization is ${roundPercent(slack.seatUtilization * 100)}% across ${slack.totalSeats} configured seats.`,
      riskLevel: "low",
      confidence: 0.88,
      estimatedMonthlySavings: roundMoney(
        (slack.totalSeats - slack.activeSeats) * (SEAT_MONTHLY_COST["Slack AI"] ?? 12),
      ),
      category: "seat-reduction",
    });
  }

  const opus = data.byModel.find((model) => model.name === "Claude Opus");
  if (opus && opus.mismatchRate > 0.25) {
    recommendations.push({
      id: "rec-opus-downgrade",
      title: "Downgrade low-complexity Claude Opus usage",
      description:
        "Route complexity scores below 4 to Claude Sonnet or Haiku instead of Claude Opus.",
      evidence: `${roundPercent(opus.mismatchRate * 100)}% of Claude Opus calls are model-task mismatches.`,
      riskLevel: "medium",
      confidence: 0.85,
      estimatedMonthlySavings: roundMoney(opus.spend * 0.35),
      category: "model-switch",
    });
  }

  const marketing = data.byTeam.find((team) => team.name === "Marketing");
  if (marketing && marketing.roi < 100) {
    recommendations.push({
      id: "rec-marketing-workflow",
      title: "Improve Marketing AI workflow efficiency",
      description:
        "Provide targeted AI training and standardize on lower-cost models for content generation tasks.",
      evidence: `Marketing ROI is ${marketing.roi}% with $${marketing.spend.toLocaleString()} monthly spend.`,
      riskLevel: "medium",
      confidence: 0.8,
      estimatedMonthlySavings: roundMoney(marketing.spend * 0.15),
      category: "workflow",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "rec-general-review",
      title: "Continue monthly AI spend review",
      description:
        "No critical optimization flags detected. Maintain quarterly tool and model audits.",
      evidence: `Organization ROI is ${data.kpis.totalROI}% with ${data.kpis.activeUsers} active users.`,
      riskLevel: "low",
      confidence: 0.7,
      estimatedMonthlySavings: roundMoney(data.kpis.costSavingsOpportunity * 0.1),
      category: "tool-consolidation",
    });
  }

  return recommendations;
}

export function buildDashboardContext(data: AnalyticsData): DashboardContext {
  return {
    period: data.period,
    totalSpend: data.kpis.totalSpend,
    totalROI: data.kpis.totalROI,
    efficiencyScore: data.kpis.efficiencyScore,
    wasteRatio: data.kpis.wasteRatio,
    hoursSaved: roundScore(data.kpis.hoursSaved),
    activeUsers: data.kpis.activeUsers,
    underusedSeats: data.kpis.underusedSeats,
    byTeam: data.byTeam,
    byTool: data.byTool,
    byModel: data.byModel,
    anomalies: data.anomalies,
    topSpenders: data.topSpenders,
    lowProductivity: data.lowProductivity,
  };
}

export function computeAnalyticsData(logs: UsageLog[] = loadUsageLogs()): AnalyticsData {
  const byTeam = getTeamSummaries(logs);
  const byTool = getToolSummaries(logs);
  const byModel = getModelFitAnalysis(logs);
  const anomalies = detectAnomalies(logs, byTeam, byTool, byModel);

  const totalSpend = roundMoney(logs.reduce((sum, log) => sum + log.cost, 0));
  const hoursSaved = logs.reduce((sum, log) => sum + log.estimatedHoursSaved, 0);
  const successfulTasks = logs.reduce(
    (sum, log) => sum + log.successfulTasks,
    0,
  );
  const totalROI = calculateROI(hoursSaved, totalSpend);
  const wasteRatio = calculateWasteRatio(logs);
  const activeUsers = new Set(logs.map((log) => log.user)).size;
  const underusedSeats = countUnderusedSeats(byTool);
  const costSavingsOpportunity = estimateCostSavingsOpportunity(byTool);

  const kpis: AnalyticsKpis = {
    totalSpend,
    totalROI,
    efficiencyScore: calculateEfficiencyScore(
      totalROI,
      getSuccessRate(logs),
      1 - getModelMismatchRate(logs),
      getAverageSeatUtilization(byTool),
    ),
    wasteRatio,
    hoursSaved: roundScore(hoursSaved),
    activeUsers,
    underusedSeats,
    costSavingsOpportunity,
    costPerSuccessfulTask: calculateCPT(totalSpend, successfulTasks),
  };

  const partial = { byTeam, byTool, byModel, kpis, anomalies };
  const recommendations = getOptimizationRecommendations(partial);

  const metricsPeriod =
    typeof mockMetrics === "object" &&
    mockMetrics !== null &&
    "period" in mockMetrics &&
    typeof mockMetrics.period === "string"
      ? mockMetrics.period
      : "Current period";

  return {
    period: metricsPeriod,
    logs,
    kpis,
    byTeam,
    byTool,
    byModel,
    anomalies,
    topSpenders: getUserSummaries(logs)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 5),
    lowProductivity: getLowProductivityUsers(logs),
    recommendations,
  };
}

export function getAvailableMonths(logs: UsageLog[]): string[] {
  const months = new Set(logs.map((log) => log.date.slice(0, 7)));
  return [...months].sort((a, b) => a.localeCompare(b));
}

export function filterUsageLogs(
  logs: UsageLog[],
  filters: Pick<CostAnalyticsFilters, "team" | "tool" | "month">,
): UsageLog[] {
  return logs.filter((log) => {
    if (filters.team !== "all" && log.team !== filters.team) {
      return false;
    }
    if (filters.tool !== "all" && log.tool !== filters.tool) {
      return false;
    }
    if (filters.month !== "all" && !log.date.startsWith(filters.month)) {
      return false;
    }
    return true;
  });
}

function summarizeLogs(logs: UsageLog[]): {
  spend: number;
  hoursSaved: number;
  roi: number;
} {
  const spend = roundMoney(logs.reduce((sum, log) => sum + log.cost, 0));
  const hoursSaved = logs.reduce(
    (sum, log) => sum + log.estimatedHoursSaved,
    0,
  );
  return {
    spend,
    hoursSaved: roundScore(hoursSaved),
    roi: calculateROI(hoursSaved, spend),
  };
}

export function getCostBreakdown(
  logs: UsageLog[],
  filters: CostAnalyticsFilters,
): CostBreakdownRow[] {
  const filtered = filterUsageLogs(logs, filters);
  const totalSpend = filtered.reduce((sum, log) => sum + log.cost, 0);

  const groups = new Map<string, UsageLog[]>();

  for (const log of filtered) {
    let key: string;
    switch (filters.dimension) {
      case "team":
        key = log.team;
        break;
      case "tool":
        key = log.tool;
        break;
      case "month":
        key = log.date.slice(0, 7);
        break;
    }
    const bucket = groups.get(key) ?? [];
    bucket.push(log);
    groups.set(key, bucket);
  }

  return [...groups.entries()]
    .map(([key, bucket]) => {
      const summary = summarizeLogs(bucket);
      return {
        key,
        label: key,
        spend: summary.spend,
        sharePercent:
          totalSpend > 0 ? roundPercent((summary.spend / totalSpend) * 100) : 0,
        roi: summary.roi,
        hoursSaved: summary.hoursSaved,
      };
    })
    .sort((a, b) => b.spend - a.spend);
}

export function categorizeUsageLog(
  log: UsageLog,
  teamAverageCpt: number,
): AICategorizationResult {
  const roi = calculateROI(log.estimatedHoursSaved, log.cost);
  const successRate =
    log.totalTasks > 0 ? log.successfulTasks / log.totalTasks : 0;
  const isMismatch =
    HIGH_COMPLEXITY_MODELS.includes(log.model) &&
    log.complexityScore < COMPLEXITY_MISMATCH_THRESHOLD;

  let productivityLevel: AICategorizationResult["productivityLevel"] = "medium";
  if (roi >= 200 && successRate >= 0.7) {
    productivityLevel = "high";
  } else if (roi < 80 || successRate < 0.5) {
    productivityLevel = "low";
  }

  let impactLevel: AICategorizationResult["impactLevel"] = "medium-impact";
  if (roi < LOW_ROI_THRESHOLD || isMismatch) {
    impactLevel = "waste";
  } else if (teamAverageCpt > 0 && log.cost > teamAverageCpt * 2.5 && roi < 150) {
    impactLevel = "high-cost";
  } else if (roi >= 250) {
    impactLevel = "high-impact";
  }

  const confidence = roundScore(
    Math.min(
      0.98,
      0.7 +
        (successRate > 0.6 ? 0.1 : 0) +
        (isMismatch ? 0.12 : 0) +
        (roi > 100 ? 0.08 : 0),
    ),
  );

  return {
    category: log.usageType,
    productivityLevel,
    impactLevel,
    confidence,
  };
}

export function getCategorizedUsageLogs(logs: UsageLog[]): CategorizedUsageLog[] {
  const teamCpt = new Map<Team, number>();
  for (const team of getTeamSummaries(logs)) {
    teamCpt.set(team.name, team.cpt);
  }

  return logs.map((log) => ({
    ...log,
    roi: calculateROI(log.estimatedHoursSaved, log.cost),
    categorization: categorizeUsageLog(log, teamCpt.get(log.team) ?? 0),
  }));
}

export function getPaginatedLogs<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; totalPages: number; totalItems: number } {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    totalItems,
  };
}

export function getTeamDetailCards(data: AnalyticsData): TeamDetailCard[] {
  return data.byTeam.map((team) => {
    const teamLogs = data.logs.filter((log) => log.team === team.name);
    const hoursSaved = roundScore(
      teamLogs.reduce((sum, log) => sum + log.estimatedHoursSaved, 0),
    );
    const totalTasks = teamLogs.reduce((sum, log) => sum + log.totalTasks, 0);
    const successfulTasks = teamLogs.reduce(
      (sum, log) => sum + log.successfulTasks,
      0,
    );
    const avgComplexityScore =
      teamLogs.length === 0
        ? 0
        : roundScore(
            teamLogs.reduce((sum, log) => sum + log.complexityScore, 0) /
              teamLogs.length,
          );

    return {
      ...team,
      hoursSaved,
      totalTasks,
      successfulTasks,
      avgComplexityScore,
    };
  });
}

export function getToolComparisonRows(data: AnalyticsData): ToolComparisonRow[] {
  interface MetricsToolRow {
    name: Tool;
    spend: number;
    roi: number;
    seatUtilization: number;
    activeSeats: number;
    totalSeats: number;
    requests: number;
    hoursSaved: number;
    cpt: number;
  }

  const metricsTools =
    typeof mockMetrics === "object" &&
    mockMetrics !== null &&
    "byTool" in mockMetrics &&
    Array.isArray(mockMetrics.byTool)
      ? (mockMetrics.byTool as MetricsToolRow[])
      : [];

  return data.byTool
    .map((tool) => {
      const metricsRow = metricsTools.find((row) => row.name === tool.name);
      return {
        name: tool.name,
        spend: tool.spend,
        roi: tool.roi,
        seatUtilization: tool.seatUtilization,
        activeSeats: tool.activeSeats,
        totalSeats: tool.totalSeats,
        requests: metricsRow?.requests ?? 0,
        hoursSaved: roundScore(metricsRow?.hoursSaved ?? 0),
        cpt:
          metricsRow?.cpt ??
          calculateCPT(
            tool.spend,
            data.logs
              .filter((log) => log.tool === tool.name)
              .reduce((sum, log) => sum + log.successfulTasks, 0),
          ),
      };
    })
    .sort((a, b) => b.spend - a.spend);
}

export function getModelUsageRows(data: AnalyticsData): ModelUsageRow[] {
  interface MetricsModelRow {
    name: Model;
    tier?: string;
    spend: number;
    requests?: number;
    avgComplexityScore: number;
    mismatchRate: number;
    roi?: number;
  }

  const metricsModels =
    typeof mockMetrics === "object" &&
    mockMetrics !== null &&
    "byModel" in mockMetrics &&
    Array.isArray(mockMetrics.byModel)
      ? (mockMetrics.byModel as MetricsModelRow[])
      : [];

  return data.byModel
    .map((model) => {
      const metricsRow = metricsModels.find((row) => row.name === model.name);
      const modelLogs = data.logs.filter((log) => log.model === model.name);
      const hoursSaved = modelLogs.reduce(
        (sum, log) => sum + log.estimatedHoursSaved,
        0,
      );
      const spend = model.spend;
      return {
        name: model.name,
        tier: metricsRow?.tier ?? "mid",
        spend,
        requests:
          metricsRow?.requests ??
          modelLogs.reduce((sum, log) => sum + log.requests, 0),
        avgComplexityScore: model.avgComplexityScore,
        mismatchRate: model.mismatchRate,
        roi:
          metricsRow?.roi ??
          calculateROI(hoursSaved, spend),
      };
    })
    .sort((a, b) => b.spend - a.spend);
}

export function getRoiEfficiencyMetrics(data: AnalyticsData): RoiEfficiencyMetrics {
  return {
    totalROI: data.kpis.totalROI,
    efficiencyScore: data.kpis.efficiencyScore,
    wasteRatio: data.kpis.wasteRatio,
    costPerSuccessfulTask: data.kpis.costPerSuccessfulTask,
    hoursSaved: data.kpis.hoursSaved,
    costSavingsOpportunity: data.kpis.costSavingsOpportunity,
  };
}
