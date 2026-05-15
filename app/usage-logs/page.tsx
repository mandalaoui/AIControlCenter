import { UsageLogsTable } from "@/components/usage-logs/usage-logs-table";
import { UsageLogsHeader } from "@/components/usage-logs/usage-logs-header";
import { DeferredContent } from "@/components/shared/deferred-content";
import { TableSkeleton } from "@/components/shared/page-skeletons";
import {
  computeAnalyticsData,
  getCategorizedUsageLogs,
} from "@/lib/analytics";

export default function UsageLogsPage() {
  const data = computeAnalyticsData();
  const logs = getCategorizedUsageLogs(data.logs).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <DeferredContent
      fallback={
        <section className="space-y-6">
          <UsageLogsHeader />
          <TableSkeleton rows={12} />
        </section>
      }
    >
      <section className="space-y-6">
        <UsageLogsHeader />
        <UsageLogsTable logs={logs} />
      </section>
    </DeferredContent>
  );
}
