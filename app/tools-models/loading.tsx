import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/shared/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-8">
      <PageHeaderSkeleton />
      <TableSkeleton rows={6} />
      <TableSkeleton rows={8} />
    </div>
  );
}
