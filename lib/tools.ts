import { toolsDirectory } from "@/data/tools-directory";
import type { AITool, AnalyticsData, Tool } from "@/lib/types";

const TOOL_ID_TO_NAME: Record<string, Tool> = {
  "openai-api": "OpenAI API",
  "anthropic-api": "Anthropic API",
  "github-copilot": "GitHub Copilot",
  cursor: "Cursor",
  "microsoft-copilot": "Microsoft Copilot",
  "slack-ai": "Slack AI",
  "google-gemini": "Google Gemini",
  "internal-agent": "Internal Agent",
};

function resolveToolName(toolId: string): Tool | undefined {
  return TOOL_ID_TO_NAME[toolId];
}

export function getToolSpend(toolId: string, analyticsData: AnalyticsData): number {
  const toolName = resolveToolName(toolId);
  if (!toolName) {
    return 0;
  }
  return (
    analyticsData.byTool.find((tool) => tool.name === toolName)?.spend ?? 0
  );
}

export function getToolROI(toolId: string, analyticsData: AnalyticsData): number {
  const toolName = resolveToolName(toolId);
  if (!toolName) {
    return 0;
  }
  return analyticsData.byTool.find((tool) => tool.name === toolName)?.roi ?? 0;
}

export function getToolSeatUtilization(
  toolId: string,
  analyticsData: AnalyticsData,
): number {
  const toolName = resolveToolName(toolId);
  if (!toolName) {
    return 0;
  }
  return (
    analyticsData.byTool.find((tool) => tool.name === toolName)
      ?.seatUtilization ?? 0
  );
}

export function enrichToolsWithOrgData(
  tools: AITool[],
  analyticsData: AnalyticsData,
): AITool[] {
  return tools.map((tool) => {
    if (!tool.connectedInOrg) {
      return tool;
    }

    return {
      ...tool,
      orgSpend: getToolSpend(tool.id, analyticsData),
      orgROI: getToolROI(tool.id, analyticsData),
      orgSeatUtilization: getToolSeatUtilization(tool.id, analyticsData),
    };
  });
}

export function getEnrichedToolsDirectory(
  analyticsData: AnalyticsData,
): AITool[] {
  return enrichToolsWithOrgData(toolsDirectory, analyticsData);
}
