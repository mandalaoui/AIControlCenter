"use client";

import { useCallback, useEffect, useState } from "react";

import type { AiNewsResponse } from "@/lib/types";

interface UseAiNewsResult {
  data: AiNewsResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAiNews(): UseAiNewsResult {
  const [data, setData] = useState<AiNewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = forceRefresh ? "/api/ai-news?refresh=true" : "/api/ai-news";
      const response = await fetch(url);
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
          items?: AiNewsResponse["items"];
          lastUpdated?: string;
        };
        if (payload.items && payload.lastUpdated) {
          setData({
            items: payload.items,
            lastUpdated: payload.lastUpdated,
            fromCache: true,
          });
          return;
        }
        throw new Error(payload.error ?? "Failed to load news");
      }
      const payload = (await response.json()) as AiNewsResponse;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load news");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNews(false);
  }, [fetchNews]);

  const refresh = useCallback(() => {
    void fetchNews(true);
  }, [fetchNews]);

  return { data, loading, error, refresh };
}
