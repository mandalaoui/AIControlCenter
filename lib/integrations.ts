import type { IntegrationConnector } from "@/lib/types";
import { CONNECTED_TOOLS, TOOL_PROVIDER_KEY } from "@/lib/tool-registry";
import usageLogs from "@/data/generated/usage-logs.generated.json";

function buildLastSyncMap(): Record<string, string | null> {
  const map: Record<string, string | null> = {};

  for (const log of usageLogs) {
    const providerKey = TOOL_PROVIDER_KEY[log.tool as keyof typeof TOOL_PROVIDER_KEY];
    if (!providerKey) continue;

    const current = map[providerKey];
    if (!current || log.date > current) {
      map[providerKey] = log.date;
    }
  }

  return map;
}

function buildDataTypeMap(): Record<string, string | null> {
  const counts: Record<string, Record<string, number>> = {};

  for (const log of usageLogs) {
    const providerKey = TOOL_PROVIDER_KEY[log.tool as keyof typeof TOOL_PROVIDER_KEY];
    if (!providerKey) continue;

    counts[providerKey] ??= {};
    counts[providerKey][log.usageType] = (counts[providerKey][log.usageType] ?? 0) + 1;
  }

  return Object.fromEntries(
    Object.entries(counts).map(([key, typeCounts]) => {
      const dominant = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      return [key, dominant];
    })
  );
}

export function getConnectedIntegrationConnectors(): IntegrationConnector[] {
  const lastSyncMap = buildLastSyncMap();
  const dataTypeMap = buildDataTypeMap();

  return CONNECTED_TOOLS.map((entry) => {
    const lastSyncDate = lastSyncMap[entry.providerKey] ?? null;
    const dominantType = dataTypeMap[entry.providerKey];

    return {
      id: entry.providerKey,
      nameKey: `integrationNames.${entry.providerKey}`,
      descriptionKey: `integrationDescriptions.${entry.providerKey}`,
      status: "connected" as const,
      lastSyncKey: lastSyncDate ? "integrationSync.absolute" : "integrationSync.never",
      lastSyncDate: lastSyncDate ?? undefined,
      dataTypeKey: dominantType
        ? `integrationDataTypes.${dominantType}`
        : `integrationDataTypes.${entry.providerKey}`,
      iconId: entry.providerKey,
    };
  });
}