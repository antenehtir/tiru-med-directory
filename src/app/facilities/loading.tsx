import { PageContainer } from "@/components/layout/PageContainer";
import { PageShell } from "@/components/layout/PageShell";
import { Skeleton, SkeletonCardGrid } from "@/components/ui/Skeleton";

export default function FacilitiesLoading() {
  return (
    <PageShell>
      <PageContainer className="py-8 sm:py-10 lg:py-14">
        <div className="grid gap-6">
          <div className="max-w-3xl">
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="mt-3 h-9 w-full max-w-xl" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-11 w-28 rounded-full" />
            <Skeleton className="h-11 w-32 rounded-full" />
            <Skeleton className="h-11 w-24 rounded-full" />
            <Skeleton className="h-11 w-28 rounded-full" />
          </div>

          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
            <div className="mt-4">
              <SkeletonCardGrid />
            </div>
          </div>
        </div>
      </PageContainer>
    </PageShell>
  );
}
