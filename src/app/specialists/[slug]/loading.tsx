import { PageContainer } from "@/components/layout/PageContainer";
import { PageShell } from "@/components/layout/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";

function SectionSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-16 w-full" />
    </div>
  );
}

export default function SpecialistDetailLoading() {
  return (
    <PageShell>
      <PageContainer className="py-8 sm:py-10 lg:py-14">
        <div className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
            {/* Header */}
            <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_14px_34px_rgba(31,41,55,0.045)] sm:p-6 lg:p-8">
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <Skeleton className="size-[120px] shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-9 w-2/3" />
                  <Skeleton className="mt-3 h-6 w-24 rounded-full" />
                  <Skeleton className="mt-3 h-5 w-1/2" />
                  <Skeleton className="mt-3 h-5 w-2/3" />
                </div>
              </div>
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

          <div className="grid gap-6">
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
}
