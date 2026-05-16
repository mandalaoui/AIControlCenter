import type { IntegrationConnector } from "@/lib/types";
import { CONNECTED_TOOLS } from "@/lib/tool-registry";

/** Display-only integration metadata keyed by provider (not operational state). */
const INTEGRATION_DISPLAY_BY_PROVIDER: Record<
  string,
  { lastSyncKey: string; dataTypeKey: string }
> = {
  openai: {
    lastSyncKey: "integrationSync.2min",
    dataTypeKey: "integrationDataTypes.openai",
  },
  anthropic: {
    lastSyncKey: "integrationSync.5min",
    dataTypeKey: "integrationDataTypes.anthropic",
  },
  github: {
    lastSyncKey: "integrationSync.1hour",
    dataTypeKey: "integrationDataTypes.github",
  },
  cursor: {
    lastSyncKey: "integrationSync.3hours",
    dataTypeKey: "integrationDataTypes.cursor",
  },
  microsoft: {
    lastSyncKey: "integrationSync.12hours",
    dataTypeKey: "integrationDataTypes.microsoft",
  },
  google: {
    lastSyncKey: "integrationSync.never",
    dataTypeKey: "integrationDataTypes.google",
  },
  slack: {
    lastSyncKey: "integrationSync.1day",
    dataTypeKey: "integrationDataTypes.slack",
  },
  internal: {
    lastSyncKey: "integrationSync.realtime",
    dataTypeKey: "integrationDataTypes.internal",
  },
};

/** Connected integrations derived from the org tool registry. */
export function getConnectedIntegrationConnectors(): IntegrationConnector[] {
  return CONNECTED_TOOLS.map((entry) => {
    const display =
      INTEGRATION_DISPLAY_BY_PROVIDER[entry.providerKey] ?? {
        lastSyncKey: "integrationSync.realtime",
        dataTypeKey: `integrationDataTypes.${entry.providerKey}`,
      };

    return {
      id: entry.providerKey,
      nameKey: `integrationNames.${entry.providerKey}`,
      descriptionKey: `integrationDescriptions.${entry.providerKey}`,
      status: "connected",
      lastSyncKey: display.lastSyncKey,
      dataTypeKey: display.dataTypeKey,
      iconId: entry.providerKey,
    };
  });
}
