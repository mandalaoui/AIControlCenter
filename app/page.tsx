import { OverviewPage } from "@/components/overview/overview-page";
import { DeferredContent } from "@/components/shared/deferred-content";
import { OverviewPageSkeleton } from "@/components/shared/page-skeletons";
import { computeAnalyticsData } from "@/lib/analytics";
import { getOverviewPageData } from "@/lib/overview";

export default function HomePage() {
  const analytics = computeAnalyticsData();
  const overview = getOverviewPageData(analytics);

  return (
    <DeferredContent fallback={<OverviewPageSkeleton />}>
      <OverviewPage data={overview} />
    </DeferredContent>
  );
}
