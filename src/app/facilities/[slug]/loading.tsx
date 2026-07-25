import { PageContainer } from "@/components/layout/PageContainer";
import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

function SectionSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-2 h-6 w-48" />
      <Skeleton className="mt-4 h-16 w-full" />
    </div>
  );
}

export default function FacilityDetailLoading() {
  return (
    <PageShell>
      <PageContainer className="py-8 sm:py-10 lg:py-14">
        <div className="grid gap-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
            {/* Header */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_14px_34px_rgba(31,41,55,0.045)] sm:p-6 lg:p-8">
              <Skeleton className="h-48 w-full rounded-2xl sm:h-56" />
              <div className="mt-6">
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="mt-3 h-9 w-3/4" />
                <Skeleton className="mt-3 h-5 w-1/2" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="mt-6 h-16 w-full rounded-2xl" />
            </div>

            {/* Sidebar (desktop) */}
            <div className="hidden rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6 lg:block">
              <div className="grid gap-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>

          <div className="grid gap-8">
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
}
