import type { UsageLog } from "@/lib/types";

import {
  PROVIDERS,
} from "@/lib/providers/provider-registry";

/**
 * Loads all provider telemetry sources,
 * normalizes them through adapters,
 * and returns a unified UsageLog array.
 */
export async function buildTelemetry(): Promise<UsageLog[]> {
  const telemetry: UsageLog[] = [];

  for (const provider of PROVIDERS) {
    try {
      const rawRecords =
        await provider.loader();

      const normalized =
        provider.adapter(rawRecords);

      telemetry.push(...normalized);

      console.log(
        `[Telemetry] ${provider.displayName}: ${normalized.length} records`,
      );
    } catch (error) {
      console.error(
        `[Telemetry] Failed provider: ${provider.id}`,
        error,
      );
    }
  }

  return telemetry.sort(
    (a, b) =>
      new Date(a.date).getTime() -
      new Date(b.date).getTime(),
  );
}