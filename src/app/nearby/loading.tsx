import { PageShell } from "@/components/layout/PageShell";
import { Skeleton, SkeletonCardGrid } from "@/components/ui/Skeleton";

export default function NearbyLoading() {
  return (
    <PageShell>
      <main className="mx-auto grid w-full max-w-6xl gap-5 overflow-x-hidden px-3 py-6 min-[360px]:px-4 sm:px-6 sm:py-10 lg:px-8">
        <div>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-2 h-9 w-full max-w-md" />
        </div>
        <Skeleton className="h-[52px] w-full rounded-2xl" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-11 w-28 rounded-full" />
          <Skeleton className="h-11 w-36 rounded-full" />
          <Skeleton className="h-11 w-24 rounded-full" />
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>
        <SkeletonCardGrid />
      </main>
    </PageShell>
  );
}
