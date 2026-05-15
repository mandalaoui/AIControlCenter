export type Team =
  | "Engineering"
  | "Product"
  | "Marketing"
  | "Sales"
  | "Operations"
  | "Customer Success";

export type Tool =
  | "OpenAI API"
  | "Anthropic API"
  | "GitHub Copilot"
  | "Cursor"
  | "Microsoft Copilot"
  | "Slack AI"
  | "Google Gemini"
  | "Internal Agent";

export type Model =
  | "GPT-4"
  | "GPT-4o"
  | "GPT-4o-mini"
  | "GPT-3.5"
  | "Claude Opus"
  | "Claude Sonnet"
  | "Claude Haiku"
  | "Gemini Pro"
  | "Gemini Ultra"
  | "N/A";

export type UsageType =
  | "coding"
  | "research"
  | "content"
  | "support"
  | "automation"
  | "analysis";

export interface UsageLog {
  id: string;
  date: string;
  team: Team;
  user: string;
  tool: Tool;
  model: Model;
  platform: string;
  usageType: UsageType;
  inputTokens: number;
  outputTokens: number;
  requests: number;
  cost: number;
  estimatedHoursSaved: number;
  successfulTasks: number;
  totalTasks: number;
  complexityScore: number;
}

export type ToolCategory =
  | "api"
  | "coding"
  | "productivity"
  | "communication"
  | "automation";

export type ModelSpeed = "fast" | "medium" | "slow";
export type ModelTier = "low" | "mid" | "high";

export interface ToolPricingPlan {
  name: string;
  priceMonthly: number;
  per: string;
  includes: string[];
  limits?: string[];
  bestFor: string;
}

export interface ToolModelInfo {
  name: string;
  displayName: string;
  contextWindow: number;
  inputPricePer1M: number;
  outputPricePer1M: number;
  strengths: string[];
  speed: ModelSpeed;
  tier: ModelTier;
  recommendedFor: string[];
  notRecommendedFor: string[];
  recommended: boolean;
}

export interface AITool {
  id: string;
  name: string;
  provider: string;
  category: ToolCategory;
  description: string;
  strengths: string[];
  limitations: string[];
  bestFor: UsageType[];
  notRecommendedFor: string[];
  connectedInOrg: boolean;
  pricing: ToolPricingPlan[];
  models: ToolModelInfo[];
  orgSpend?: number;
  orgROI?: number;
  orgSeatUtilization?: number;
}

export interface TeamSummary {
  name: Team;
  spend: number;
  roi: number;
  cpt: number;
  efficiencyScore: number;
  topTool: Tool;
  activeUsers: number;
  wasteRatio: number;
}

export interface ToolSummary {
  name: Tool;
  spend: number;
  roi: number;
  seatUtilization: number;
  activeSeats: number;
  totalSeats: number;
}

export interface ModelSummary {
  name: Model;
  spend: number;
  avgComplexityScore: number;
  mismatchRate: number;
}

export interface AnomalySummary {
  id?: string;
  description: string;
  magnitude: string;
  affectedEntity: string;
  week: string;
  params?: Record<string, string | number>;
}

export interface UserSpendSummary {
  user: string;
  team: Team;
  spend: number;
  roi: number;
  primaryTool: Tool;
}

export interface LowProductivityUser {
  user: string;
  team: Team;
  spend: number;
  roi: number;
  issue: string;
}

export interface DashboardContext {
  period: string;
  totalSpend: number;
  totalROI: number;
  efficiencyScore: number;
  wasteRatio: number;
  hoursSaved: number;
  activeUsers: number;
  underusedSeats: number;
  byTeam: TeamSummary[];
  byTool: ToolSummary[];
  byModel: ModelSummary[];
  anomalies: AnomalySummary[];
  topSpenders: UserSpendSummary[];
  lowProductivity: LowProductivityUser[];
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  evidence: string;
  riskLevel: "low" | "medium" | "high";
  confidence: number;
  estimatedMonthlySavings: number;
  category: "model-switch" | "seat-reduction" | "workflow" | "tool-consolidation";
  i18nParams?: Record<string, string | number>;
}

export type AIInsightType = "anomaly" | "trend" | "recommendation" | "risk";
export type AIInsightSeverity = "info" | "warning" | "critical";

export interface AIInsight {
  id: string;
  type: AIInsightType;
  severity: AIInsightSeverity;
  title: string;
  description: string;
  affectedEntity: string;
  estimatedSavings?: number;
  confidence: number;
  recommendedAction: string;
}

export interface QueryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnalyzeResponse {
  insights: AIInsight[];
  recommendations: OptimizationRecommendation[];
  executiveSummary: string;
}

export interface QueryResponse {
  answer: string;
}

export interface AnalyticsKpis {
  totalSpend: number;
  totalROI: number;
  efficiencyScore: number;
  wasteRatio: number;
  hoursSaved: number;
  activeUsers: number;
  underusedSeats: number;
  costSavingsOpportunity: number;
  costPerSuccessfulTask: number;
}

export interface AnalyticsData {
  period: string;
  logs: UsageLog[];
  kpis: AnalyticsKpis;
  byTeam: TeamSummary[];
  byTool: ToolSummary[];
  byModel: ModelSummary[];
  anomalies: AnomalySummary[];
  topSpenders: UserSpendSummary[];
  lowProductivity: LowProductivityUser[];
  recommendations: OptimizationRecommendation[];
}

export type KpiMetricId =
  | "totalSpend"
  | "roi"
  | "costSavingsOpportunity"
  | "hoursSaved"
  | "cpt"
  | "efficiencyScore"
  | "activeUsers"
  | "underusedSeats";

export type KpiValueFormat = "currency" | "percent" | "number" | "score";

export interface KpiCardData {
  id: KpiMetricId;
  value: number;
  changePercent: number;
  trend: number[];
  format: KpiValueFormat;
  lowerIsBetter: boolean;
  insightKey: string;
  insightParams: Record<string, unknown>;
}

export interface RoiChartItem {
  name: string;
  roi: number;
}

export interface ProviderSpendItem {
  providerKey: string;
  value: number;
}

export interface SpendOverTimePoint {
  label: string;
  openai: number;
  anthropic: number;
  github: number;
  microsoft: number;
  other: number;
}

export interface ChartInsightData {
  insightKey: string;
  insightParams: Record<string, unknown>;
}

export interface OverviewPageData {
  period: string;
  kpis: KpiCardData[];
  roiByTeam: RoiChartItem[];
  roiByTeamInsight: ChartInsightData;
  roiByTool: RoiChartItem[];
  roiByToolInsight: ChartInsightData;
  spendByProvider: ProviderSpendItem[];
  spendOverTime: SpendOverTimePoint[];
}

export type ProductivityLevel = "high" | "medium" | "low";
export type ImpactLevel =
  | "high-impact"
  | "medium-impact"
  | "high-cost"
  | "waste";

export interface AICategorizationResult {
  category: UsageType;
  productivityLevel: ProductivityLevel;
  impactLevel: ImpactLevel;
  confidence: number;
}

export interface CategorizedUsageLog extends UsageLog {
  roi: number;
  categorization: AICategorizationResult;
}

export type CostBreakdownDimension = "team" | "tool" | "month";

export interface CostAnalyticsFilters {
  dimension: CostBreakdownDimension;
  team: Team | "all";
  tool: Tool | "all";
  month: string | "all";
}

export interface CostBreakdownRow {
  key: string;
  label: string;
  spend: number;
  sharePercent: number;
  roi: number;
  hoursSaved: number;
}

export interface TeamDetailCard extends TeamSummary {
  hoursSaved: number;
  totalTasks: number;
  successfulTasks: number;
  avgComplexityScore: number;
}

export interface ToolComparisonRow {
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

export interface ModelUsageRow {
  name: Model;
  tier: string;
  spend: number;
  requests: number;
  avgComplexityScore: number;
  mismatchRate: number;
  roi: number;
}

export interface RoiEfficiencyMetrics {
  totalROI: number;
  efficiencyScore: number;
  wasteRatio: number;
  costPerSuccessfulTask: number;
  hoursSaved: number;
  costSavingsOpportunity: number;
}

export type NewsCategory =
  | "new-models"
  | "pricing"
  | "new-tools"
  | "industry";

export type NewsFilterTab = NewsCategory | "all";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: NewsCategory;
  url: string;
  publishedAt: string;
}

export interface AiNewsResponse {
  items: NewsItem[];
  lastUpdated: string;
  fromCache: boolean;
}

export type IntegrationStatus = "connected" | "disconnected" | "error";

export interface IntegrationConnector {
  id: string;
  nameKey: string;
  descriptionKey: string;
  status: IntegrationStatus;
  lastSyncKey: string;
  dataTypeKey: string;
  iconId: string;
}

export type ToolsDirectoryConnectedFilter = "all" | "connected" | "not-connected";

export interface ToolsDirectoryFilters {
  search: string;
  category: ToolCategory | "all";
  provider: string;
  connected: ToolsDirectoryConnectedFilter;
}
