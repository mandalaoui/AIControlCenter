"use client";

import { useState } from "react";
import { Bell, ChevronDown, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const dateRanges = [
  { value: "7d", labelKey: "last7Days" },
  { value: "30d", labelKey: "last30Days" },
  { value: "90d", labelKey: "last90Days" },
  { value: "year", labelKey: "thisYear" },
] as const;

export function TopBar() {
  const { t } = useTranslation("common");
  const { theme, setTheme } = useTheme();
  const [dateRange, setDateRange] = useState("30d");

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("search")}
            className="ps-10"
          />
        </div>

        <div className="relative">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            aria-label={t("dateRange")}
            className="appearance-none rounded-lg border border-border bg-input-background py-2 pe-10 ps-4 text-sm text-foreground"
          >
            {dateRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {t(range.labelKey)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute inset-e-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={t("toggleTheme")}
        >
          {theme === "dark" ? (
            <Sun className="size-5" />
          ) : (
            <Moon className="size-5" />
          )}
        </Button>

        <Button variant="ghost" size="icon" title={t("notifications")}>
          <Bell className="size-5" />
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          OM
        </div>
      </div>
    </header>
  );
}
