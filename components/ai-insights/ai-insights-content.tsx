"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { InsightCard } from "@/components/ai-insights/insight-card";
import { AiErrorState } from "@/components/shared/ai-error-state";
import { InsightCardsSkeleton } from "@/components/shared/page-skeletons";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardCard } from "@/components/dashboard-card";
import { Button } from "@/components/ui/button";
import {
  buildInsightsCachePayload,
  clearInsightsCache,
  readInsightsCache,
  writeInsightsCache,
} from "@/lib/ai-insights/insights-cache";
import type { AnalyzeResponse } from "@/lib/types";

// Always show date in English (US), not browser locale
function formatAnalyzedAt(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

async function postAnalyze(t: (key: string) => string): Promise<AnalyzeResponse> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key":
        window.localStorage.getItem("ai-control-center-api-key-demo") ?? "",
    },
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(payload.error ?? t("loadFailedAnalysis"));
  }
  return (await response.json()) as AnalyzeResponse;
}

export function AiInsightsContent() {
  const { t } = useTranslation("common");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const runAnalyze = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setData(null);
    setLoading(true);
    setError(null);
    try {
      const result = await postAnalyze(t);
      const payload = buildInsightsCachePayload(result);
      writeInsightsCache(payload);
      setData(result);
      setAnalyzedAt(payload.analyzedAt);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("loadFailedAnalysis"),
      );
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [t]);

  useEffect(() => {
    const cached = readInsightsCache();
    if (cached) {
      setData(cached.data);
      setAnalyzedAt(cached.analyzedAt);
      setLoading(false);
      return;
    }
    void runAnalyze();
  }, [runAnalyze]);

  const handleAnalyzeAgain = useCallback(async () => {
    if (inFlightRef.current) return;
    clearInsightsCache();
    await runAnalyze();
  }, [runAnalyze]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <PageHeader titleKey="aiInsights" badgeKey="aiAnalyzed" />
        <InsightCardsSkeleton />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <PageHeader titleKey="aiInsights" badgeKey="aiAnalyzed" />
        <AiErrorState message={error} onRetry={() => void runAnalyze()} />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader titleKey="aiInsights" badgeKey="aiAnalyzed" />
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleAnalyzeAgain()}
          disabled={loading}
        >
          <RefreshCw
            className={loading ? "size-4 animate-spin" : "size-4"}
            aria-hidden
          />
          {t("analyzeInsightsAgain")}
        </Button>
      </div>

      {analyzedAt ? (
        <div className="flex items-center justify-end w-full">
          <p className="text-xs text-muted-foreground">
            {t("lastAnalyzed")}: {formatAnalyzedAt(analyzedAt)}
          </p>
        </div>
      ) : null}

      {error ? (
        <AiErrorState
          message={error}
          onRetry={() => void handleAnalyzeAgain()}
          compact
        />
      ) : null}

      <DashboardCard title={t("executiveSummary")}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {data.executiveSummary}
        </p>
      </DashboardCard>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {data.insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  );
}
