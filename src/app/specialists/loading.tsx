import { PageContainer } from "@/components/layout/PageContainer";
import { PageShell } from "@/components/layout/PageShell";
import { Skeleton, SkeletonSpecialistCardGrid } from "@/components/ui/Skeleton";

export default function SpecialistsLoading() {
  return (
    <PageShell>
      <PageContainer className="py-8 sm:py-10 lg:py-14">
        <div className="grid gap-6">
          {/* Header */}
          <div className="max-w-3xl">
            <Skeleton className="h-9 w-44 rounded-full" />
            <Skeleton className="mt-3 h-9 w-full max-w-xl" />
            <Skeleton className="mt-4 h-6 w-56" />
          </div>

          {/* Specialty filter card */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(17,24,39,0.025)]">
            <Skeleton className="h-5 w-32" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Skeleton className="h-11 w-32 rounded-full" />
              <Skeleton className="h-11 w-28 rounded-full" />
              <Skeleton className="h-11 w-36 rounded-full" />
            </div>
          </div>

          {/* Search + filters row */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl sm:w-28" />
          </div>

          <SkeletonSpecialistCardGrid />
        </div>
      </PageContainer>
    </PageShell>
  );
}
