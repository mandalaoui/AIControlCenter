import type { Tool } from "@/lib/types";

export interface ToolRegistryEntry {
  id: string;           // "openai-api"
  name: Tool;           // "OpenAI API"
  providerKey: string;  // "openai"
  connectedInOrg: boolean;
  totalSeats: number;   // 0 = token-based
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

// Derived lookups — single source of truth
export const TOOL_BY_NAME = Object.fromEntries(
  TOOL_REGISTRY.map((t) => [t.name, t]),
) as Record<Tool, ToolRegistryEntry>;

export const TOOL_BY_ID = Object.fromEntries(
  TOOL_REGISTRY.map((t) => [t.id, t]),
);

export const TOOL_PROVIDER_KEY = Object.fromEntries(
  TOOL_REGISTRY.map((t) => [t.name, t.providerKey]),
) as Record<Tool, string>;

export const SEAT_BASED_TOOLS = Object.fromEntries(
  TOOL_REGISTRY
    .filter((t) => t.totalSeats > 0)
    .map((t) => [t.name, t.totalSeats]),
) as Partial<Record<Tool, number>>;

export const SEAT_MONTHLY_COST = Object.fromEntries(
  TOOL_REGISTRY
    .filter((t) => t.monthlySeatCost > 0)
    .map((t) => [t.name, t.monthlySeatCost]),
) as Partial<Record<Tool, number>>;

export const CONNECTED_TOOLS = TOOL_REGISTRY.filter((t) => t.connectedInOrg);

export const SPEND_LINE_KEYS = [
    "openai",
    "anthropic",
    "github",
    "microsoft",
    "other",
  ] as const;
  
  export type SpendLineKey = (typeof SPEND_LINE_KEYS)[number];
  