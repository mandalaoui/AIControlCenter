"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { AnalyzeResponse } from "@/lib/types";

interface UseAnalyzeResult {
  data: AnalyzeResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAnalyze(): UseAnalyzeResult {
  const { t } = useTranslation("common");
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error ?? t("loadFailedAnalysis"));
      }
      const payload = (await response.json()) as AnalyzeResponse;
      setData(payload);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("loadFailedAnalysis"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchAnalyze();
  }, [fetchAnalyze]);

  return { data, loading, error, refetch: fetchAnalyze };
}
