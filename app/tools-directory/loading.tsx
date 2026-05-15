import {
  CardGridSkeleton,
  PageHeaderSkeleton,
} from "@/components/shared/page-skeletons";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton count={8} />
    </div>
  );
}
