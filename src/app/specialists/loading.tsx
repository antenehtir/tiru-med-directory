import { PageContainer } from "@/components/layout/PageContainer";
import { PageShell } from "@/components/layout/PageShell";
import { Skeleton, SkeletonSpecialistCardGrid } from "@/components/ui/Skeleton";

export default function SpecialistsLoading() {
  return (
    <PageShell>
      <PageContainer className="py-8 sm:py-10 lg:py-14">
        <div className="grid gap-6">
          <div className="max-w-3xl">
            <Skeleton className="h-8 w-40 rounded-full" />
            <Skeleton className="mt-3 h-9 w-full max-w-xl" />
          </div>
          <SkeletonSpecialistCardGrid />
        </div>
      </PageContainer>
    </PageShell>
  );
}
