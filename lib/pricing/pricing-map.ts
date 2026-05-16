import type { Model } from "@/lib/types";

export const INPUT_COST: Record<Model, number> = {
  "GPT-4":         0.03,
  "GPT-4o":        0.005,
  "GPT-4o-mini":   0.00015,
  "GPT-3.5":       0.0005,

  "Claude Opus":   0.015,
  "Claude Sonnet": 0.003,
  "Claude Haiku":  0.00025,

  "Gemini Pro":    0.00125,
  "Gemini Ultra":  0.01,

  "N/A":           0,
};

export const OUTPUT_COST: Record<Model, number> = {
  "GPT-4":         0.06,
  "GPT-4o":        0.015,
  "GPT-4o-mini":   0.0006,
  "GPT-3.5":       0.0015,

  "Claude Opus":   0.075,
  "Claude Sonnet": 0.015,
  "Claude Haiku":  0.00125,

  "Gemini Pro":    0.005,
  "Gemini Ultra":  0.03,

  "N/A":           0,
};