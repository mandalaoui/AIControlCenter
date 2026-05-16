import type { AnalyzeResponse } from "@/lib/types";

export const AI_INSIGHTS_CACHE_VERSION = "v1";
export const AI_INSIGHTS_CACHE_KEY = "ai-control-center-ai-insights-cache";

export interface AiInsightsCachePayload {
  version: typeof AI_INSIGHTS_CACHE_VERSION;
  analyzedAt: string;
  period?: string;
  data: AnalyzeResponse;
}

export function isValidInsightsCache(
  payload: unknown,
): payload is AiInsightsCachePayload {
  if (!payload || typeof payload !== "object") return false;
  const record = payload as Record<string, unknown>;
  if (record.version !== AI_INSIGHTS_CACHE_VERSION) return false;
  if (typeof record.analyzedAt !== "string") return false;
  const data = record.data;
  if (!data || typeof data !== "object") return false;
  const dataRecord = data as Record<string, unknown>;
  if (!Array.isArray(dataRecord.insights)) return false;
  if (typeof dataRecord.executiveSummary !== "string") return false;
  return true;
}

export function buildInsightsCachePayload(
  data: AnalyzeResponse,
  period?: string,
): AiInsightsCachePayload {
  return {
    version: AI_INSIGHTS_CACHE_VERSION,
    analyzedAt: new Date().toISOString(),
    ...(period ? { period } : {}),
    data,
  };
}

export function readInsightsCache(): AiInsightsCachePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AI_INSIGHTS_CACHE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidInsightsCache(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeInsightsCache(payload: AiInsightsCachePayload): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AI_INSIGHTS_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage full or unavailable
  }
}

export function clearInsightsCache(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(AI_INSIGHTS_CACHE_KEY);
  } catch {
    // ignore
  }
}
