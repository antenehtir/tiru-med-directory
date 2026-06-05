import { DoctorsPage } from "@/components/doctors/DoctorsPage";
import { PageShell } from "@/components/layout/PageShell";
import { sampleDoctors } from "@/data/sampleDoctors";
import {
  filterDoctorsByQuery,
  filterDoctorsBySpecialty,
  normalizeSearchParam,
} from "@/lib/frontend-search-filters";
import { getSupabasePublicDoctorCards } from "@/lib/supabase/doctors-public-read";
import type { PublicProviderCard } from "@/types/public-listings";
import type { Doctor, DoctorTelemedicineStatus } from "@/types/doctor";

export const dynamic = "force-dynamic";

type DoctorsRouteProps = {
  searchParams?: Promise<{
    q?: string | string[];
    specialty?: string | string[];
  }>;
};

export default async function DoctorsRoute({ searchParams }: DoctorsRouteProps) {
  const params = await searchParams;
  const query = normalizeSearchParam(params?.q);
  const specialty = normalizeSearchParam(params?.specialty);
  const doctors = await getDoctorsForRoute();
  const filteredDoctors = filterDoctorsByQuery(
    filterDoctorsBySpecialty(doctors, specialty),
    query,
  );

  return (
    <PageShell>
      <DoctorsPage
        activeQuery={query}
        activeSpecialty={specialty}
        doctors={filteredDoctors}
      />
    </PageShell>
  );
}

async function getDoctorsForRoute(): Promise<Doctor[]> {
  const supabaseResult = await getSupabasePublicDoctorCards();

  if (supabaseResult.status !== "success" || supabaseResult.cards.length === 0) {
    return sampleDoctors;
  }

  return mapPublicDoctorCardsToDoctors(supabaseResult.cards);
}

function mapPublicDoctorCardsToDoctors(cards: PublicProviderCard[]): Doctor[] {
  return cards.map((card) => ({
    id: card.id,
    name: card.name,
    slug: card.slug,
    specialty: card.categoryLabel,
    facility: card.affiliations[0] ?? "Facility not listed",
    location: card.locationLabel,
    availability: card.availabilityPreview ?? "Availability not listed",
    verificationStatus: card.verificationStatus,
    telemedicineStatus: mapTelemedicinePreviewToStatus(
      card.telemedicinePreview,
    ),
    profileInitials: createDoctorInitials(card.name),
    profileActionLabel: card.primaryActionLabel,
    bookingActionLabel: card.secondaryActionLabel,
    detailHref: card.listingHref,
  }));
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
