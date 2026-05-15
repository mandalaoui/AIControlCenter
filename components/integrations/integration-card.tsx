"use client";

import { Check, Clock, Shield, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IntegrationIcon } from "@/components/integrations/integration-icon";
import { Button } from "@/components/ui/button";
import type { IntegrationConnector } from "@/lib/types";

interface IntegrationCardProps {
  connector: IntegrationConnector;
}

export function IntegrationCard({ connector }: IntegrationCardProps) {
  const { t } = useTranslation("common");
  const isConnected = connector.status === "connected";

  return (
    <article className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent/30">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <IntegrationIcon iconId={connector.iconId} />
          <div>
            <h3 className="font-semibold text-foreground">{t(connector.nameKey)}</h3>
            <p className="text-xs text-muted-foreground">
              {t(connector.descriptionKey)}
            </p>
          </div>
        </div>
        {isConnected ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/30 px-2.5 py-1 text-xs font-medium text-green-500">
            <Check className="size-3.5" aria-hidden />
            {t("connected")}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <X className="size-3.5" aria-hidden />
            {t("notConnected")}
          </span>
        )}
      </div>

      <div className="mb-4 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p>
            <span className="text-muted-foreground">{t("lastSync")}: </span>
            <span className="font-medium text-foreground">
              {t(connector.lastSyncKey)}
            </span>
          </p>
        </div>
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p>
            <span className="text-muted-foreground">{t("dataType")}: </span>
            <span className="text-foreground">{t(connector.dataTypeKey)}</span>
          </p>
        </div>
      </div>

      <Button
        variant={isConnected ? "outline" : "default"}
        className="w-full"
        type="button"
      >
        {isConnected ? t("configure") : t("connect")}
      </Button>
    </article>
  );
}
