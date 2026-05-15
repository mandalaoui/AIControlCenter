export const languages = ["en"] as const;
export type Language = (typeof languages)[number];

export const defaultLanguage: Language = "en";
export const fallbackLng: Language = "en";
export const namespaces = ["common"] as const;
export const defaultNS = "common";
