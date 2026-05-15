"use client";

import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAiNews } from "@/components/ai-news/use-ai-news";
import { NewsFilterTabs } from "@/components/ai-news/news-filter-tabs";
import { NewsItemCard } from "@/components/ai-news/news-item-card";
import { AiErrorState } from "@/components/shared/ai-error-state";
import { CardGridSkeleton } from "@/components/shared/page-skeletons";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import type { NewsFilterTab } from "@/lib/types";

export function NewsFeedView() {
  const { t, i18n } = useTranslation("common");
  const { data, loading, error, refresh } = useAiNews();
  const [activeTab, setActiveTab] = useState<NewsFilterTab>("all");

  const filteredItems = useMemo(() => {
    if (!data) {
      return [];
    }
    if (activeTab === "all") {
      return data.items;
    }
    return data.items.filter((item) => item.category === activeTab);
  }, [data, activeTab]);

  const lastUpdatedLabel = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleString(
        i18n.language === "he" ? "he-IL" : "en-US",
      )
    : null;

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <PageHeader titleKey="aiNews" badgeKey="aiAnalyzed" />
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader titleKey="aiNews" badgeKey="aiAnalyzed" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <NewsFilterTabs activeTab={activeTab} onChange={setActiveTab} />
        <div className="flex items-center gap-3">
          {lastUpdatedLabel ? (
            <p className="text-xs text-muted-foreground">
              {t("lastUpdated")}: {lastUpdatedLabel}
              {data?.fromCache ? ` (${t("cached")})` : ""}
            </p>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
            {t("refresh")}
          </Button>
        </div>
      </div>

      {error ? (
        <AiErrorState message={error} onRetry={refresh} compact={Boolean(data)} />
      ) : null}

      {loading && data ? (
        <p className="text-sm text-muted-foreground">{t("loadingNews")}</p>
      ) : null}

      {filteredItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noNewsForCategory")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <NewsItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
