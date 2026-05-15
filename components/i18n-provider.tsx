"use client";

import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import { initI18n } from "@/lib/i18n/client";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initI18n();
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-background" aria-hidden />;
  }

  return <I18nextProvider i18n={initI18n()}>{children}</I18nextProvider>;
}
