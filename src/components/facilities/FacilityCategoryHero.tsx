import Link from "next/link";
import { facilityCategoryIcons } from "./category-icons";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";

type FacilityCategoryHeroProps = {
  category: FacilityCategoryFilter;
  categoryLabel: string;
  count: number;
};

export function FacilityCategoryHero({
  category,
  categoryLabel,
  count,
}: FacilityCategoryHeroProps) {
  const Icon = facilityCategoryIcons[category];

  return (
    <header className="rounded-card border border-teal-100 bg-gradient-to-br from-teal-50 via-card to-card px-5 py-8 sm:px-8">
      <Link
        className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
        href="/facilities"
      >
        &larr; All categories
      </Link>
      <div className="mt-4 flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-card bg-primary/10 text-primary">
          <Icon className="size-8" />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-balance text-foreground sm:text-[2.75rem]">
            {categoryLabel}
          </h1>
          <p className="mt-1 text-base font-medium text-muted-foreground">
            {count} {count === 1 ? "provider" : "providers"}
          </p>
        </div>
      </div>
    </header>
  );
}
