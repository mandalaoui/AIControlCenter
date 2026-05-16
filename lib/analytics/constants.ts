import type { Model } from "@/lib/types";

export const HOURLY_RATE = 75;
export const MINIMUM_EFFECTIVE_COST = 10;
export const LOW_ROI_THRESHOLD = 50;

export const RECOMMENDATION_CONFIDENCE_MIN = 0.5;
export const RECOMMENDATION_CONFIDENCE_MAX = 0.98;
/** Weak signals must not exceed medium confidence. */
export const RECOMMENDATION_WEAK_SIGNAL_CAP = 0.82;
export const RECOMMENDATION_WEAK_SIGNAL_THRESHOLD = 0.45;

export const HIGH_COMPLEXITY_MODELS: Model[] = [
  "Claude Opus",
  "GPT-4",
  "Gemini Ultra",
];
