import i18next from "i18next";

import enCommon from "@/locales/en/common.json";
import enExtras from "@/locales/en/i18n-extras.json";
import { defaultLanguage } from "@/lib/i18n/settings";

let initialized = false;

function ensureI18n(): typeof i18next {
  if (!initialized) {
    void i18next.init({
      resources: {
        en: { common: { ...enCommon, ...enExtras } },
      },
      lng: defaultLanguage,
      fallbackLng: defaultLanguage,
      defaultNS: "common",
      interpolation: { escapeValue: false },
    });
    initialized = true;
  }
  return i18next;
}

export function getServerT() {
  const i18n = ensureI18n();
  return i18n.getFixedT(defaultLanguage, "common");
}
