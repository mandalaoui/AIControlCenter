"use client";

import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import type { NewsItem } from "@/lib/types";

interface NewsItemCardProps {
  item: NewsItem;
}

export function NewsItemCard({ item }: NewsItemCardProps) {
  const { t, i18n } = useTranslation("common");
  const title =
    item.id.startsWith("fb-") && i18n.exists(`common:fallbackNews.${item.id}.title`)
    ? t(`fallbackNews.${item.id}.title`)
    : item.title;
  const summary =
    item.id.startsWith("fb-") &&
    t(`fallbackNews.${item.id}.summary`) !== `fallbackNews.${item.id}.summary`
      ? t(`fallbackNews.${item.id}.summary`)
      : item.summary;

  return (
    <article className="flex flex-col rounded-lg border border-border bg-card p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{item.source}</Badge>
        <Badge variant="secondary">{t(`newsTabs.${item.category}`)}</Badge>
      </div>
      <h3 className="mb-2 text-base font-semibold text-foreground">{title}</h3>
      <p className="mb-4 flex-1 text-sm text-muted-foreground">{summary}</p>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:underline"
      >
        {t("readMore")}
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
    </article>
  );
}
