"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation("common");

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-border bg-card border-e">
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-foreground">
              {t("appTitle")}
            </h1>
            <p className="text-xs text-muted-foreground">{t("appSubtitle")}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  <span>{t(item.key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-center text-xs text-muted-foreground">
          {t("copyright")}
        </p>
      </div>
    </aside>
  );
}
