import type { Tool } from "@/lib/types";

export interface ToolRegistryEntry {
  id: string;
  name: Tool;
  providerKey: string;
  connectedInOrg: boolean;
  totalSeats: number;
  monthlySeatCost: number;
}

export const TOOL_REGISTRY: ToolRegistryEntry[] = [
  {
    id: "openai-api",
    name: "OpenAI API",
    providerKey: "openai",
    connectedInOrg: true,
    totalSeats: 0,
    monthlySeatCost: 0,
  },
  {
    id: "anthropic-api",
    name: "Anthropic API",
    providerKey: "anthropic",
    connectedInOrg: true,
    totalSeats: 0,
    monthlySeatCost: 0,
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    providerKey: "github",
    connectedInOrg: true,
    totalSeats: 60,
    monthlySeatCost: 19,
  },
  {
    id: "cursor",
    name: "Cursor",
    providerKey: "cursor",
    connectedInOrg: true,
    totalSeats: 52,
    monthlySeatCost: 32,
  },
  {
    id: "microsoft-copilot",
    name: "Microsoft Copilot",
    providerKey: "microsoft",
    connectedInOrg: true,
    totalSeats: 55,
    monthlySeatCost: 30,
  },
  {
    id: "slack-ai",
    name: "Slack AI",
    providerKey: "slack",
    connectedInOrg: true,
    totalSeats: 50,
    monthlySeatCost: 12,
  },
  {
    id: "google-gemini",
    name: "Google Gemini",
    providerKey: "google",
    connectedInOrg: false,
    totalSeats: 0,
    monthlySeatCost: 0,
  },
  {
    id: "internal-agent",
    name: "Internal Agent",
    providerKey: "internal",
    connectedInOrg: true,
    totalSeats: 0,
    monthlySeatCost: 0,
  },
];

export const SPEND_LINE_KEYS = [
  "openai",
  "anthropic",
  "github",
  "microsoft",
  "other",
] as const;

export type SpendLineKey = (typeof SPEND_LINE_KEYS)[number];

export const TOOL_BY_NAME = Object.fromEntries(
  TOOL_REGISTRY.map((t) => [t.name, t]),
) as Record<Tool, ToolRegistryEntry>;

export const TOOL_BY_ID = Object.fromEntries(
  TOOL_REGISTRY.map((t) => [t.id, t]),
) as Record<string, ToolRegistryEntry>;

export const TOOL_PROVIDER_KEY = Object.fromEntries(
  TOOL_REGISTRY.map((t) => [t.name, t.providerKey]),
) as Record<Tool, string>;

export const SEAT_TOTAL_BY_TOOL_ID = Object.fromEntries(
  TOOL_REGISTRY.filter((t) => t.totalSeats > 0).map((t) => [t.id, t.totalSeats]),
) as Record<string, number>;

export const SEAT_MONTHLY_COST_BY_TOOL_ID = Object.fromEntries(
  TOOL_REGISTRY
    .filter((t) => t.monthlySeatCost > 0)
    .map((t) => [t.id, t.monthlySeatCost]),
) as Record<string, number>;

export const CONNECTED_TOOLS = TOOL_REGISTRY.filter((t) => t.connectedInOrg);

export function getRegistryEntryForTool(tool: Tool): ToolRegistryEntry | undefined {
  return TOOL_BY_NAME[tool];
}

export function getToolIdForName(tool: Tool): string | undefined {
  return TOOL_BY_NAME[tool]?.id;
}

export function getSpendLineKeyForToolId(toolId: string): SpendLineKey {
  const provider = TOOL_BY_ID[toolId]?.providerKey;
  if (provider === "openai") return "openai";
  if (provider === "anthropic") return "anthropic";
  if (provider === "github") return "github";
  if (
    provider === "microsoft" ||
    provider === "cursor" ||
    provider === "slack"
  ) {
    return "microsoft";
  }
  return "other";
}

export function getSpendLineKeyForToolName(toolName: Tool): SpendLineKey {
  const toolId = getToolIdForName(toolName);
  if (!toolId) {
    return "other";
  }
  return getSpendLineKeyForToolId(toolId);
}

export function getProviderKeyForToolId(toolId: string): string {
  return TOOL_BY_ID[toolId]?.providerKey ?? "other";
}
