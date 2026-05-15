import {
  ChartGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <ChartGridSkeleton count={1} />
    </div>
  );
}
