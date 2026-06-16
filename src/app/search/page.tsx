import { PageShell } from "@/components/layout/PageShell";
import { SearchResultsPage } from "@/components/search-results/SearchResultsPage";
import { normalizeSearchParam } from "@/lib/frontend-search-filters";
import { getSupabasePublicDoctorCards } from "@/lib/supabase/doctors-public-read";
import type { Doctor, DoctorTelemedicineStatus } from "@/types/doctor";
import type { PublicProviderCard } from "@/types/public-listings";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams?: Promise<{
    focus?: string | string[];
    q?: string | string[];
    category?: string | string[];
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const shouldFocusSearch = normalizeSearchParam(params?.focus) === "1";
  const query = normalizeSearchParam(params?.q);
  const category = normalizeSearchParam(params?.category);
  const doctors = await getDoctorsForSearch();

  return (
    <PageShell>
      <SearchResultsPage
        category={category}
        doctors={doctors}
        focusSearch={shouldFocusSearch}
        query={query}
      />
    </PageShell>
  );
}

async function getDoctorsForSearch(): Promise<Doctor[]> {
  const supabaseResult = await getSupabasePublicDoctorCards();

  if (supabaseResult.status !== "success" || supabaseResult.cards.length === 0) {
    return [];
  }

  return supabaseResult.cards.map(mapPublicDoctorCardToDoctor);
}

function mapPublicDoctorCardToDoctor(card: PublicProviderCard): Doctor {
  return {
    id: card.id,
    name: card.name,
    slug: card.slug,
    specialty: card.categoryLabel,
    facility: card.affiliations[0] ?? "Facility not listed",
    location: card.locationLabel,
    availability: card.availabilityPreview ?? "Availability details are being verified.",
    verificationStatus: card.verificationStatus,
    telemedicineStatus: mapTelemedicinePreviewToStatus(card.telemedicinePreview),
    profileInitials: createDoctorInitials(card.name),
    profileActionLabel: card.primaryActionLabel,
    bookingActionLabel: card.secondaryActionLabel,
    detailHref: card.listingHref,
  };
}

function mapTelemedicinePreviewToStatus(
  preview: string | undefined,
): DoctorTelemedicineStatus {
  const normalizedPreview = preview?.toLowerCase() ?? "";

  if (normalizedPreview.includes("available")) {
    return "available";
  }

  if (normalizedPreview.includes("planned")) {
    return "planned";
  }

  return "not-available";
}

function createDoctorInitials(name: string): string {
  const parts = name
    .replace(/^dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);

  const initials = parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "DR";
}
