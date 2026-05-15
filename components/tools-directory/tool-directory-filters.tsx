"use client";

import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FilterSelect } from "@/components/shared/filter-select";
import { Input } from "@/components/ui/input";
import type { ToolsDirectoryFilters, ToolCategory } from "@/lib/types";

interface ToolDirectoryFiltersProps {
  filters: ToolsDirectoryFilters;
  providers: string[];
  categories: ToolCategory[];
  onChange: (filters: ToolsDirectoryFilters) => void;
}

export function ToolDirectoryFilters({
  filters,
  providers,
  categories,
  onChange,
}: ToolDirectoryFiltersProps) {
  const { t } = useTranslation("common");

  const categoryOptions = [
    { value: "all", label: t("allCategories") },
    ...categories.map((category) => ({
      value: category,
      label: t(`toolCategories.${category}`),
    })),
  ];

  const providerOptions = [
    { value: "all", label: t("allProviders") },
    ...providers.map((provider) => ({ value: provider, label: provider })),
  ];

  const connectedOptions = [
    { value: "all", label: t("allConnectionStatus") },
    { value: "connected", label: t("connectedOnly") },
    { value: "not-connected", label: t("notConnectedOnly") },
  ];

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 lg:flex-row lg:items-end">
      <div className="flex-1 space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t("searchTools")}
        </label>
        <div className="relative">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) =>
              onChange({ ...filters, search: event.target.value })
            }
            placeholder={t("searchToolsPlaceholder")}
            className="ps-9"
          />
        </div>
      </div>
      <FilterSelect
        label={t("category")}
        value={filters.category}
        options={categoryOptions}
        onChange={(value) =>
          onChange({
            ...filters,
            category: value as ToolsDirectoryFilters["category"],
          })
        }
      />
      <FilterSelect
        label={t("provider")}
        value={filters.provider}
        options={providerOptions}
        onChange={(value) => onChange({ ...filters, provider: value })}
      />
      <FilterSelect
        label={t("connectionStatus")}
        value={filters.connected}
        options={connectedOptions}
        onChange={(value) =>
          onChange({
            ...filters,
            connected: value as ToolsDirectoryFilters["connected"],
          })
        }
      />
    </div>
  );
}
