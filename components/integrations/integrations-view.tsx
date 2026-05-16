"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { IntegrationCard } from "@/components/integrations/integration-card";
import { PageHeader } from "@/components/shared/page-header";
import { getConnectedIntegrationConnectors } from "@/lib/integrations";

export function IntegrationsView() {
  const { t } = useTranslation("common");
  const connectors = useMemo(() => getConnectedIntegrationConnectors(), []);
  const connectedCount = connectors.length;

  return (
    <div className="space-y-6">
      <PageHeader titleKey="integrations" />
      <p className="text-sm text-muted-foreground">
        {t("integrationsSummary", {
          connected: connectedCount,
        })}
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {connectors.map((connector) => (
          <IntegrationCard key={connector.id} connector={connector} />
        ))}
      </div>
    </div>
  );
}
