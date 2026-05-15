import type { AITool, ToolsDirectoryFilters, ToolCategory } from "@/lib/types";

export function getToolProviders(tools: AITool[]): string[] {
  return [...new Set(tools.map((tool) => tool.provider))].sort();
}

export function getToolCategories(tools: AITool[]): ToolCategory[] {
  return [...new Set(tools.map((tool) => tool.category))].sort();
}

export function filterToolsDirectory(
  tools: AITool[],
  filters: ToolsDirectoryFilters,
): AITool[] {
  const query = filters.search.trim().toLowerCase();

  return tools.filter((tool) => {
    if (filters.category !== "all" && tool.category !== filters.category) {
      return false;
    }

    if (filters.provider !== "all" && tool.provider !== filters.provider) {
      return false;
    }

    if (filters.connected === "connected" && !tool.connectedInOrg) {
      return false;
    }

    if (filters.connected === "not-connected" && tool.connectedInOrg) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = [
      tool.name,
      tool.provider,
      tool.description,
      tool.category,
      ...tool.strengths,
      ...tool.bestFor,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}
