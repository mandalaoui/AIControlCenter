"use client";

import { useTranslation } from "react-i18next";

import { integrationConnectors } from "@/data/integrations";
import { IntegrationCard } from "@/components/integrations/integration-card";
import { PageHeader } from "@/components/shared/page-header";

export function IntegrationsView() {
  const { t } = useTranslation("common");
  const connectedCount = integrationConnectors.filter(
    (connector) => connector.status === "connected",
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader titleKey="integrations" />
      <p className="text-sm text-muted-foreground">
        {t("integrationsSummary", {
          connected: connectedCount,
          total: integrationConnectors.length,
        })}
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {integrationConnectors.map((connector) => (
          <IntegrationCard key={connector.id} connector={connector} />
        ))}
      </div>
    </div>
  );
}
