import { PageHeader } from "@/components/shared/page-header";
import { DeferredContent } from "@/components/shared/deferred-content";
import { CardGridSkeleton } from "@/components/shared/page-skeletons";
import { TeamsGrid } from "@/components/teams/teams-grid";
import { computeAnalyticsData, getTeamDetailCards } from "@/lib/analytics";

export default function TeamsPage() {
  const data = computeAnalyticsData();
  const teams = getTeamDetailCards(data);

  return (
    <DeferredContent
      fallback={
        <div className="space-y-6">
          <PageHeader titleKey="teams" />
          <CardGridSkeleton count={6} />
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader titleKey="teams" />
        <TeamsGrid teams={teams} />
      </div>
    </DeferredContent>
  );
}
