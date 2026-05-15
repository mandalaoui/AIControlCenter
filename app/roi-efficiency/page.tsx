import { PageHeader } from "@/components/shared/page-header";
import { DeferredContent } from "@/components/shared/deferred-content";
import {
  CardGridSkeleton,
  TableSkeleton,
} from "@/components/shared/page-skeletons";
import { ModelFitTable } from "@/components/roi-efficiency/model-fit-table";
import { RoiMetricsGrid } from "@/components/roi-efficiency/roi-metrics-grid";
import {
  computeAnalyticsData,
  getModelUsageRows,
  getRoiEfficiencyMetrics,
} from "@/lib/analytics";

export default function RoiEfficiencyPage() {
  const data = computeAnalyticsData();
  const metrics = getRoiEfficiencyMetrics(data);
  const modelRows = getModelUsageRows(data);

  return (
    <DeferredContent
      fallback={
        <div className="space-y-8">
          <PageHeader titleKey="roiEfficiency" />
          <CardGridSkeleton count={4} />
          <TableSkeleton rows={6} />
        </div>
      }
    >
      <div className="space-y-8">
        <PageHeader titleKey="roiEfficiency" />
        <RoiMetricsGrid metrics={metrics} />
        <ModelFitTable rows={modelRows} />
      </div>
    </DeferredContent>
  );
}
