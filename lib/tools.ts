import { toolsDirectory } from "@/data/tools-directory";
import type {
  AITool,
  AIToolDirectoryEntry,
  AnalyticsData,
} from "@/lib/types";
import { TOOL_BY_ID } from "@/lib/tool-registry";

function getToolSummaryById(toolId: string, analyticsData: AnalyticsData) {
  return analyticsData.byTool.find((tool) => tool.id === toolId);
}

export function getToolSpend(toolId: string, analyticsData: AnalyticsData): number {
  return getToolSummaryById(toolId, analyticsData)?.spend ?? 0;
}

export function getToolROI(toolId: string, analyticsData: AnalyticsData): number {
  return getToolSummaryById(toolId, analyticsData)?.roi ?? 0;
}

export function getToolSeatUtilization(
  toolId: string,
  analyticsData: AnalyticsData,
): number {
  return getToolSummaryById(toolId, analyticsData)?.seatUtilization ?? 0;
}

export function enrichDirectoryEntry(
  entry: AIToolDirectoryEntry,
  analyticsData: AnalyticsData,
): AITool {
  const registry = TOOL_BY_ID[entry.id];
  const connectedInOrg = registry?.connectedInOrg ?? false;

  if (!connectedInOrg) {
    return { ...entry, connectedInOrg };
  }

  return {
    ...entry,
    connectedInOrg,
    orgSpend: getToolSpend(entry.id, analyticsData),
    orgROI: getToolROI(entry.id, analyticsData),
    orgSeatUtilization: getToolSeatUtilization(entry.id, analyticsData),
  };
}

export function enrichToolsWithOrgData(
  tools: AIToolDirectoryEntry[],
  analyticsData: AnalyticsData,
): AITool[] {
  return tools.map((tool) => enrichDirectoryEntry(tool, analyticsData));
}

export function getEnrichedToolsDirectory(
  analyticsData: AnalyticsData,
): AITool[] {
  return enrichToolsWithOrgData(toolsDirectory, analyticsData);
}
