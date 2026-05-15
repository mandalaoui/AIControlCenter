import { CostAnalyticsContent } from "@/components/cost-analytics/cost-analytics-content";
import { DeferredContent } from "@/components/shared/deferred-content";
import { ChartGridSkeleton, PageHeaderSkeleton } from "@/components/shared/page-skeletons";
import { computeAnalyticsData, loadUsageLogs } from "@/lib/analytics";
import type { Team, Tool } from "@/lib/types";

export default function CostAnalyticsPage() {
  const data = computeAnalyticsData();
  const teams = [...new Set(data.logs.map((log) => log.team))] as Team[];
  const tools = [...new Set(data.logs.map((log) => log.tool))] as Tool[];

  return (
    <DeferredContent
      fallback={
        <div className="space-y-6">
          <PageHeaderSkeleton />
          <ChartGridSkeleton count={1} />
        </div>
      }
    >
      <CostAnalyticsContent
        logs={loadUsageLogs()}
        teams={teams.sort()}
        tools={tools.sort()}
      />
    </DeferredContent>
  );
}
