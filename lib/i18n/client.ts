"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/locales/en/common.json";
import enExtras from "@/locales/en/i18n-extras.json";

function mergeLocale<T extends Record<string, unknown>>(
  base: T,
  extras: Record<string, unknown>,
): T {
  return { ...base, ...extras };
}
import {
  defaultLanguage,
  defaultNS,
  fallbackLng,
} from "@/lib/i18n/settings";

const resources = {
  en: { common: mergeLocale(enCommon, enExtras) },
} as const;

let initialized = false;

export function initI18n(): typeof i18n {
  if (!initialized) {
    void i18n.use(initReactI18next).init({
      resources,
      lng: defaultLanguage,
      fallbackLng,
      defaultNS,
      interpolation: { escapeValue: false },
    });
    initialized = true;
  }
  return i18n;
}

export { i18n };
