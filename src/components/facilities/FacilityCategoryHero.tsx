import { PageIntro } from "@/components/layout/PageIntro";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";
import { facilityCategoryIcons } from "./category-icons";

type FacilityCategoryHeroProps = {
  category: FacilityCategoryFilter;
  categoryLabel: string;
  count: number;
};

// A category view of /facilities. Same opening as every other page, with the
// category's icon beside the live provider count.
export function FacilityCategoryHero({ category, categoryLabel, count }: FacilityCategoryHeroProps) {
  const Icon = facilityCategoryIcons[category];

  return (
    <PageIntro
      back={{ href: "/facilities", label: "All categories" }}
      description={
        <span className="inline-flex items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-home-mint-strong text-home-accent-text">
            <Icon className="size-4" />
          </span>
          {count} {count === 1 ? "provider" : "providers"}
        </span>
      }
      eyebrow="Find care"
      title={categoryLabel}
    />
  );
}
