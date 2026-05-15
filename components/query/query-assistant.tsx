"use client";

import { useEffect, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { QueryMessageList } from "@/components/query/query-message-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { QueryMessage } from "@/lib/types";

const SUGGESTED_KEYS = [
  "suggestedQ1",
  "suggestedQ2",
  "suggestedQ3",
  "suggestedQ4",
  "suggestedQ5",
] as const;

export function QueryAssistant() {
  const { t } = useTranslation("common");
  const [messages, setMessages] = useState<QueryMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMessages([{ role: "assistant", content: t("queryWelcome") }]);
  }, [t]);

  const sendMessage = async (text: string) => {
    const question = text.trim();
    if (!question || loading) {
      return;
    }

    const userMessage: QueryMessage = { role: "user", content: question };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          history: history.filter(
            (m) => m.role === "user" || m.role === "assistant",
          ),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(payload.error ?? t("queryFailed"));
      }

      const payload = (await response.json()) as { answer: string };
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: payload.answer },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("queryFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 bg-primary px-4 py-4 text-primary-foreground">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/10">
          <Sparkles className="size-5" aria-hidden />
        </div>
        <div>
          <h3 className="font-semibold">{t("queryAssistant")}</h3>
          <p className="text-xs opacity-80">{t("querySubtitle")}</p>
        </div>
      </div>

      <div className="border-b border-border bg-muted/30 p-4">
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => void sendMessage(t(key))}
              disabled={loading}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-blue-500 hover:text-blue-500"
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      <QueryMessageList messages={messages} loading={loading} error={error} />

      <div className="flex gap-2 border-t border-border p-4">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void sendMessage(input);
            }
          }}
          placeholder={t("queryPlaceholder")}
          disabled={loading}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={() => void sendMessage(input)}
          disabled={loading || !input.trim()}
          aria-label={t("send")}
        >
          <Send className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

