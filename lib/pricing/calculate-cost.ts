import type { Model } from "@/lib/types";

import {
  INPUT_COST,
  OUTPUT_COST,
} from "./pricing-map";

export function calculateCost(
  model: Model,
  inputTokens: number,
  outputTokens: number,
): number {
  const inputCost =
    (inputTokens / 1000) *
    INPUT_COST[model];

  const outputCost =
    (outputTokens / 1000) *
    OUTPUT_COST[model];

  const total = inputCost + outputCost;

  return Math.round(total * 10000) / 10000;
}