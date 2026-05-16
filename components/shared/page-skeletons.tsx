import { Skeleton } from "@/components/ui/skeleton";

export function PageHeaderSkeleton() {
  return <Skeleton className="h-8 w-56" />;
}

export function KpiGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="space-y-3 rounded-lg border border-border bg-card p-5"
        >
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ChartGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="space-y-3 rounded-lg border border-border bg-card p-5"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ))}
    </div>
  );
}

export function UsageLogsFiltersSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="space-y-1.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function CategorizationPanelSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-5">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-full max-w-2xl" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-4">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="space-y-3 rounded-lg border border-border bg-card p-5"
        >
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}

export function InsightCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border border-border bg-card p-5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-border bg-card p-5"
          >
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function OverviewPageSkeleton() {
  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <KpiGridSkeleton />
      </section>
      <section className="space-y-5">
        <Skeleton className="h-8 w-40" />
        <ChartGridSkeleton count={2} />
      </section>
      <section className="space-y-5">
        <Skeleton className="h-8 w-36" />
        <ChartGridSkeleton count={2} />
      </section>
    </div>
  );
}
