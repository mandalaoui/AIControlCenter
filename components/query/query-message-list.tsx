"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AiErrorState } from "@/components/shared/ai-error-state";
import { cn } from "@/lib/utils";
import type { QueryMessage } from "@/lib/types";

interface QueryMessageListProps {
  messages: QueryMessage[];
  loading: boolean;
  error: string | null;
}

export function QueryMessageList({
  messages,
  loading,
  error,
}: QueryMessageListProps) {
  const { t } = useTranslation("common");

  return (
    <div className="h-96 space-y-4 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={cn(
            "flex gap-3",
            message.role === "user" && "justify-end",
          )}
        >
          {message.role === "assistant" ? (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
              <Sparkles className="size-4 text-blue-500" aria-hidden />
            </div>
          ) : null}
          <div
            className={cn(
              "max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-line",
              message.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground",
            )}
          >
            {message.content}
          </div>
        </div>
      ))}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t("queryThinking")}
        </div>
      ) : null}
      {error ? <AiErrorState message={error} compact /> : null}
    </div>
  );
}

