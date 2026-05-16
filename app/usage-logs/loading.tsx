import {
  CategorizationPanelSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
  UsageLogsFiltersSkeleton,
} from "@/components/shared/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CategorizationPanelSkeleton />
      <UsageLogsFiltersSkeleton />
      <TableSkeleton rows={12} />
    </div>
  );
}
