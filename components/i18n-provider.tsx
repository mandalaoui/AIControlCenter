"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { I18nextProvider } from "react-i18next";

import { initI18n } from "@/lib/i18n/client";
import {
  defaultLanguage,
  type Language,
} from "@/lib/i18n/settings";

const STORAGE_KEY = "ai-control-center-language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") {
    return defaultLanguage;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "he" ? "he" : defaultLanguage;
}

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredLanguage();
    setLanguage(stored);
    initI18n(stored);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    document.documentElement.lang = language;
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    window.localStorage.setItem(STORAGE_KEY, language);
    void initI18n(language).changeLanguage(language);
  }, [language, ready]);

  if (!ready) {
    return null;
  }

  return (
    <I18nextProvider i18n={initI18n(language)}>
      <LanguageContext.Provider value={{ language, setLanguage }}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within I18nProvider");
  }
  return context;
}

export function useToggleLanguage(): () => void {
  const { language, setLanguage } = useLanguage();
  return () => setLanguage(language === "en" ? "he" : "en");
}
