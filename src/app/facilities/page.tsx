import { FacilitiesPage } from "@/components/facilities/FacilitiesPage";
import { PageShell } from "@/components/layout/PageShell";
import { sampleFacilities } from "@/data/sampleFacilities";
import { getPublicFacilityCardsFromSource } from "@/lib/public-listing-source";
import type { PublicProviderCard } from "@/types/public-listings";
import type { Facility } from "@/types/facility";

export const dynamic = "force-dynamic";

export default async function FacilitiesRoute() {
  const facilitiesSource = await getPublicFacilityCardsFromSource({
    mode: "supabase-facilities-preview",
  });
  const facilities = mapPublicFacilityCardsToFacilities(
    facilitiesSource.cards,
  );

  return (
    <PageShell>
      <FacilitiesPage facilities={facilities} />
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
    };
  });
}
