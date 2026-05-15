"use client";

import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DashboardCard } from "@/components/dashboard-card";
import { Button } from "@/components/ui/button";

interface AiErrorStateProps {
  message?: string | null;
  onRetry?: () => void;
  compact?: boolean;
}

export function AiErrorState({ message, onRetry, compact }: AiErrorStateProps) {
  const { t } = useTranslation("common");

  if (compact) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
        <AlertCircle className="size-4 shrink-0" aria-hidden />
        <span className="flex-1">{message ?? t("loadFailed")}</span>
        {onRetry ? (
          <Button variant="ghost" size="sm" className="h-auto px-2 py-0" onClick={onRetry}>
            {t("retry")}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <DashboardCard title={t("errorTitle")}>
      <div className="flex items-start gap-2 text-sm text-red-500">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
        <span>{message ?? t("loadFailed")}</span>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          {t("retry")}
        </Button>
      ) : null}
    </DashboardCard>
  );
}
