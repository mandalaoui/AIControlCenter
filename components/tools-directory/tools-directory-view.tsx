"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ToolDetailSheet } from "@/components/tools-directory/tool-detail-sheet";
import { ToolCard } from "@/components/tools-directory/tool-card";
import { ToolDirectoryFilters } from "@/components/tools-directory/tool-directory-filters";
import { PageHeader } from "@/components/shared/page-header";
import {
  filterToolsDirectory,
  getToolCategories,
  getToolProviders,
} from "@/lib/tools-directory-filters";
import type { AITool, ToolsDirectoryFilters } from "@/lib/types";

interface ToolsDirectoryViewProps {
  tools: AITool[];
}

const DEFAULT_FILTERS: ToolsDirectoryFilters = {
  search: "",
  category: "all",
  provider: "all",
  connected: "all",
};

export function ToolsDirectoryView({ tools }: ToolsDirectoryViewProps) {
  const { t } = useTranslation("common");
  const [filters, setFilters] = useState<ToolsDirectoryFilters>(DEFAULT_FILTERS);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const providers = useMemo(() => getToolProviders(tools), [tools]);
  const categories = useMemo(() => getToolCategories(tools), [tools]);
  const filteredTools = useMemo(
    () => filterToolsDirectory(tools, filters),
    [tools, filters],
  );

  const handleSelectTool = (tool: AITool) => {
    setSelectedTool(tool);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader titleKey="toolsDirectory" />
      <ToolDirectoryFilters
        filters={filters}
        providers={providers}
        categories={categories}
        onChange={setFilters}
      />
      {filteredTools.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noToolsMatch")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={handleSelectTool} />
          ))}
        </div>
      )}
      <ToolDetailSheet
        tool={selectedTool}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
}
