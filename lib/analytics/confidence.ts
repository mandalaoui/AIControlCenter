import {
  RECOMMENDATION_CONFIDENCE_MAX,
  RECOMMENDATION_CONFIDENCE_MIN,
  RECOMMENDATION_WEAK_SIGNAL_CAP,
  RECOMMENDATION_WEAK_SIGNAL_THRESHOLD,
} from "./constants";
import type { RecommendationConfidenceInput } from "./types";

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

/** Log-scaled sample contribution; saturates near 100 observations. */
function normalizeSampleSize(sampleSize: number): number {
  const n = Math.max(0, sampleSize);
  if (n <= 1) {
    return 0;
  }

  return Math.min(1, Math.log10(n) / 2);
}

/** Two-decimal rounding preserves legacy confidence granularity (e.g. 0.92). */
function roundConfidence(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Deterministic recommendation confidence in [0.5, 0.98].
 * Larger samples, stronger signals, and higher consistency raise confidence.
 * Weak signals are capped at medium confidence.
 */
export function calculateRecommendationConfidence(
  input: RecommendationConfidenceInput,
): number {
  const signal = clamp01(input.signalStrength);
  const consistency = clamp01(input.consistency);
  const severity = clamp01(input.severity ?? 0);
  const sample = normalizeSampleSize(input.sampleSize);

  const confidenceBase = 0.54;

  let confidence =
    confidenceBase +
    signal * 0.27 +
    sample * 0.08 +
    consistency * 0.07 +
    severity * 0.04;

  if (signal < RECOMMENDATION_WEAK_SIGNAL_THRESHOLD) {
    confidence = Math.min(confidence, RECOMMENDATION_WEAK_SIGNAL_CAP);
  }

  confidence = Math.max(
    RECOMMENDATION_CONFIDENCE_MIN,
    Math.min(RECOMMENDATION_CONFIDENCE_MAX, confidence),
  );

  return roundConfidence(
    Math.max(
      RECOMMENDATION_CONFIDENCE_MIN,
      Math.min(RECOMMENDATION_CONFIDENCE_MAX, confidence),
    ),
  );
}
