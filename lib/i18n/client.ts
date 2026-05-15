"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "@/locales/en/common.json";
import heCommon from "@/locales/he/common.json";
import {
  defaultLanguage,
  defaultNS,
  fallbackLng,
  type Language,
} from "@/lib/i18n/settings";

const resources = {
  en: { common: enCommon },
  he: { common: heCommon },
} as const;

let initialized = false;

export function initI18n(language: Language = defaultLanguage): typeof i18n {
  if (!initialized) {
    void i18n.use(initReactI18next).init({
      resources,
      lng: language,
      fallbackLng,
      defaultNS,
      interpolation: { escapeValue: false },
    });
    initialized = true;
  } else if (i18n.language !== language) {
    void i18n.changeLanguage(language);
  }
  return i18n;
}

export { i18n };
