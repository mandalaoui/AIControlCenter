"use client";

import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PageHeaderProps {
  titleKey: string;
  badgeKey?: string;
}

export function PageHeader({ titleKey, badgeKey }: PageHeaderProps) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="text-2xl font-semibold text-foreground">{t(titleKey)}</h2>
      {badgeKey ? (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-500/30 bg-muted/50 px-2 py-1 text-xs font-medium text-blue-500">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {t(badgeKey)}
        </span>
      ) : null}
    </div>
  );
}
