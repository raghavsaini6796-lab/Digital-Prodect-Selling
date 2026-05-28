import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard loading skeleton — shown by Next.js while the page suspends.
 * Mirrors the layout of DashboardPage for a seamless loading experience.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <Skeleton className="h-80 w-full rounded-lg" />
    </div>
  );
}
