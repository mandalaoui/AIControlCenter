"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import type { NewsFilterTab } from "@/lib/types";

interface NewsFilterTabsProps {
  activeTab: NewsFilterTab;
  onChange: (tab: NewsFilterTab) => void;
}

const TABS: NewsFilterTab[] = [
  "all",
  "new-models",
  "pricing",
  "new-tools",
  "industry",
];

export function NewsFilterTabs({ activeTab, onChange }: NewsFilterTabsProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === tab
              ? "border-blue-500/40 bg-blue-500/10 text-blue-500"
              : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          {t(`newsTabs.${tab}`)}
        </button>
      ))}
    </div>
  );
}
