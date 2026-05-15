"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { I18nProvider } from "@/components/i18n-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}
