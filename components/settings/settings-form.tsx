"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

import { useLanguage } from "@/components/i18n-provider";
import { DashboardCard } from "@/components/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Language } from "@/lib/i18n/settings";

const ORG_STORAGE_KEY = "ai-control-center-org-name";
const API_KEY_STORAGE_KEY = "ai-control-center-api-key-demo";

export function SettingsForm() {
  const { t } = useTranslation("common");
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [orgName, setOrgName] = useState("Acme Corp");
  const [apiKey, setApiKey] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedOrg = window.localStorage.getItem(ORG_STORAGE_KEY);
    if (storedOrg) {
      setOrgName(storedOrg);
    }
    const storedKey = window.localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    window.localStorage.setItem(ORG_STORAGE_KEY, orgName);
    window.localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    setSavedMessage(t("settingsSaved"));
    window.setTimeout(() => setSavedMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader titleKey="settings" />

      <DashboardCard title={t("organizationSettings")}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="org-name"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              {t("orgName")}
            </label>
            <Input
              id="org-name"
              value={orgName}
              onChange={(event) => setOrgName(event.target.value)}
              placeholder={t("orgNamePlaceholder")}
            />
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title={t("appearanceSettings")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("theme")}
            </label>
            <Select
              value={theme ?? "system"}
              onValueChange={(value) => setTheme(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("themeLight")}</SelectItem>
                <SelectItem value="dark">{t("themeDark")}</SelectItem>
                <SelectItem value="system">{t("themeSystem")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("language")}
            </label>
            <Select
              value={language}
              onValueChange={(value) => setLanguage(value as Language)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t("languageEn")}</SelectItem>
                <SelectItem value="he">{t("languageHe")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title={t("apiKeySettings")}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("apiKeyHint")}</p>
          <div className="space-y-1.5">
            <label
              htmlFor="api-key"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              {t("anthropicApiKey")}
            </label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={t("apiKeyPlaceholder")}
              autoComplete="off"
            />
          </div>
          <p className="text-xs text-muted-foreground">{t("apiKeyUiOnly")}</p>
        </div>
      </DashboardCard>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave}>
          {t("saveSettings")}
        </Button>
        {savedMessage ? (
          <span className="text-sm text-green-500">{savedMessage}</span>
        ) : null}
      </div>
    </div>
  );
}
