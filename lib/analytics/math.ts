import { HOURLY_RATE, MINIMUM_EFFECTIVE_COST } from "./constants";

export function roundMoney(value: number): number {
  if (value > 0 && value < 0.01) {
    return Number(value.toFixed(4));
  }

  return Math.round(value * 100) / 100;
}

export function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

export function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateROI(
  estimatedHoursSaved: number,
  cost: number,
): number {
  if (cost <= 0) {
    return 0;
  }

  const effectiveCost = Math.max(cost, MINIMUM_EFFECTIVE_COST);

  return roundPercent(
    (((estimatedHoursSaved * HOURLY_RATE) - effectiveCost) / effectiveCost) *
      100,
  );
}

export function calculateCPT(
  cost: number,
  successfulTasks: number,
): number {
  if (successfulTasks <= 0) {
    return 0;
  }

  return roundMoney(cost / successfulTasks);
}
