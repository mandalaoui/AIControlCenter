"use client";

import { useEffect, useState, type ReactNode } from "react";

interface DeferredContentProps {
  children: ReactNode;
  fallback: ReactNode;
  delayMs?: number;
}

export function DeferredContent({
  children,
  fallback,
  delayMs = 120,
}: DeferredContentProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  if (!ready) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
