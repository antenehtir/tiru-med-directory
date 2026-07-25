import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { SearchResultsPage } from "@/components/search-results/SearchResultsPage";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";
import { getSupabasePublicDoctorCards } from "@/lib/supabase/doctors-public-read";
import type { Doctor, DoctorTelemedicineStatus } from "@/types/doctor";
import type { PublicProviderCard } from "@/types/public-listings";

// 1hr revalidate meant edits/approvals could take up to an hour to appear —
// matched to the 60s window used by the other listing pages.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Search — Tiru",
  description: "Search private healthcare providers in Addis Ababa.",
};

export default async function SearchPage() {
  const [doctors, facilities] = await Promise.all([
    getDoctorsForSearch(),
    getFacilitiesFromDB(),
  ]);

  return (
    <PageShell>
      <Suspense>
        <SearchResultsPage doctors={doctors} facilities={facilities} />
      </Suspense>
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
