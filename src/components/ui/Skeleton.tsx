// Base pulsing placeholder block. Compose with className to size/shape it —
// e.g. <Skeleton className="h-4 w-1/2 rounded-md" />.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

// Mirrors FacilityCard's structure (banner + title/location + pill row +
// hours line + 4-button action row) so real content doesn't shift the layout
// when it replaces this skeleton.
export function SkeletonCard() {
  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-14 rounded-full" />
        </div>
        <div className="mt-4 border-t border-border pt-3">
          <Skeleton className="h-4 w-2/5" />
        </div>
        <div className="mt-auto flex gap-2 pt-3">
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-11 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Grid of SkeletonCards matching FacilityCardGrid's layout
// (sm:grid-cols-2 lg:grid-cols-3).
export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Mirrors SpecialistCard's structure (circular avatar + name/role lines +
// language pill row) — no banner or action row, unlike SkeletonCard.
export function SkeletonSpecialistCard() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Skeleton className="size-16 shrink-0 rounded-full sm:size-[72px]" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-2 h-5 w-16 rounded-full" />
          <Skeleton className="mt-2 h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-2/5" />
      <div className="flex flex-wrap gap-1">
        <Skeleton className="h-6 w-14 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonSpecialistCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonSpecialistCard key={i} />
      ))}
    </div>
  );
}
