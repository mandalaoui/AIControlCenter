"use client";

import { KpiCard } from "@/components/overview/kpi-card";
import type { KpiCardData } from "@/lib/types";

interface KpiGridProps {
  kpis: KpiCardData[];
}

export function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}
