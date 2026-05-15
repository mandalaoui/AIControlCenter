import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";
import { getServerT } from "@/lib/i18n/server";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = getServerT();
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
