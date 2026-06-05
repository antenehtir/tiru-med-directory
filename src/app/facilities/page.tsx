import { FacilitiesPage } from "@/components/facilities/FacilitiesPage";
import { PageShell } from "@/components/layout/PageShell";
import { sampleFacilities } from "@/data/sampleFacilities";
import {
  filterFacilitiesByCategory,
  filterFacilitiesByQuery,
  getFacilityCategoryLabel,
  normalizeFacilityCategoryParam,
  normalizeSearchParam,
} from "@/lib/frontend-search-filters";
import { getPublicFacilityCardsFromSource } from "@/lib/public-listing-source";
import type { PublicProviderCard } from "@/types/public-listings";
import type { Facility } from "@/types/facility";

export const dynamic = "force-dynamic";

type FacilitiesRouteProps = {
  searchParams?: Promise<{
    category?: string | string[];
    q?: string | string[];
  }>;
};

export default async function FacilitiesRoute({
  searchParams,
}: FacilitiesRouteProps) {
  const params = await searchParams;
  const category = normalizeFacilityCategoryParam(params?.category);
  const query = normalizeSearchParam(params?.q);
  const facilitiesSource = await getPublicFacilityCardsFromSource({
    mode: "supabase-facilities-preview",
  });
  const facilities = filterFacilitiesByQuery(
    filterFacilitiesByCategory(
      mapPublicFacilityCardsToFacilities(facilitiesSource.cards),
      category,
    ),
    query,
  );

  return (
    <PageShell>
      <FacilitiesPage
        activeCategory={category}
        activeCategoryLabel={getFacilityCategoryLabel(category)}
        activeQuery={query}
        facilities={facilities}
      />
    </PageShell>
  );
}

const sampleFacilitiesById = new Map(
  sampleFacilities.map((facility) => [facility.id, facility]),
);

function mapPublicFacilityCardsToFacilities(
  cards: PublicProviderCard[],
): Facility[] {
  if (cards.length === 0) {
    return sampleFacilities;
  }

  return cards.map((card) => {
    const sampleFacility = sampleFacilitiesById.get(card.id);

    if (sampleFacility) {
      return sampleFacility;
    }

    return {
      id: card.id,
      name: card.name,
      slug: card.slug,
      category: card.categoryLabel,
      subcategory: card.summary,
      services: card.services,
      location: card.locationLabel,
      address: card.locationLabel,
      workingHours: card.hoursPreview ?? "Hours not listed",
      verificationStatus: card.verificationStatus,
      isOpen: false,
      availabilityNote: card.availabilityPreview ?? "Availability not listed",
      contactActionLabel: card.primaryActionLabel,
      directionsActionLabel: card.secondaryActionLabel,
      detailHref: card.listingHref,
    };
  });
}
