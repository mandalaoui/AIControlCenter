"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function InfoTooltip({ text }: { text: string }) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        tabIndex={0}
        className="ml-1 align-middle text-muted-foreground hover:text-foreground focus:outline-none"
        aria-label={t("info")}
      >
        <Info className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg border border-border bg-popover p-3 text-sm text-muted-foreground shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
}