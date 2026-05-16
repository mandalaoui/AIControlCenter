import { toolsDirectory } from "@/data/tools-directory";
import type { AITool, AnalyticsData, Tool } from "@/lib/types";
import { TOOL_BY_ID } from "./tool-registry";

function resolveToolName(toolId: string): Tool | undefined {
  return TOOL_BY_ID[toolId]?.name;
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
