import { PageHeader } from "@/components/shared/page-header";
import { DeferredContent } from "@/components/shared/deferred-content";
import { TableSkeleton } from "@/components/shared/page-skeletons";
import { ModelUsageTable } from "@/components/tools-models/model-usage-table";
import { ToolComparisonTable } from "@/components/tools-models/tool-comparison-table";
import {
  computeAnalyticsData,
  getModelUsageRows,
  getToolComparisonRows,
} from "@/lib/analytics";

export default function ToolsModelsPage() {
  const data = computeAnalyticsData();
  const toolRows = getToolComparisonRows(data);
  const modelRows = getModelUsageRows(data);

  return (
    <DeferredContent
      fallback={
        <div className="space-y-8">
          <PageHeader titleKey="toolsModels" />
          <TableSkeleton rows={6} />
          <TableSkeleton rows={8} />
        </div>
      }
    >
      <div className="space-y-8">
        <PageHeader titleKey="toolsModels" />
        <ToolComparisonTable rows={toolRows} />
        <ModelUsageTable rows={modelRows} />
      </div>
    </DeferredContent>
  );
}
