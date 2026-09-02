import type { Metadata } from "next";
import { FacilitiesPage } from "@/components/facilities/FacilitiesPage";
import { PageShell } from "@/components/layout/PageShell";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";
import {
  filterFacilitiesByCategory,
  filterFacilitiesByQuery,
  filterFacilitiesBySpecialtyKeyword,
  getFacilityCategoryLabel,
  normalizeFacilityCategoryParam,
  normalizeSearchParam,
} from "@/lib/frontend-search-filters";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Facilities — Tiru",
  description:
    "Browse private hospitals, specialty centers and clinics in Addis Ababa.",
};

type FacilitiesRouteProps = {
  searchParams?: Promise<{
    category?: string | string[];
    q?: string | string[];
    specialty?: string | string[];
  }>;
};

export default async function FacilitiesRoute({
  searchParams,
}: FacilitiesRouteProps) {
  const params = await searchParams;
  const category = normalizeFacilityCategoryParam(params?.category);
  const query = normalizeSearchParam(params?.q);
  // Was gated behind category === "specialty", so a specialty deep link
  // (e.g. from the homepage's specialty sections) without that category also
  // set silently filtered nothing. category and specialty are independent,
  // composable filters (filterFacilitiesByCategory and
  // filterFacilitiesBySpecialtyKeyword don't depend on each other) — a
  // specialty like "Internal Medicine" is offered across hospitals, clinics,
  // and specialty centers alike, so restricting it to one category would
  // also have undercounted results relative to what a cross-category
  // audit finds.
  const specialty = normalizeSearchParam(params?.specialty);
  const allFacilities = await getFacilitiesFromDB();
  const facilities = filterFacilitiesBySpecialtyKeyword(
    filterFacilitiesByQuery(
      filterFacilitiesByCategory(allFacilities, category),
      query,
    ),
    specialty,
  );

  return (
    <PageShell>
      <FacilitiesPage
        activeCategory={category}
        activeCategoryLabel={getFacilityCategoryLabel(category)}
        activeSpecialty={specialty}
        facilities={facilities}
      />
    </PageShell>
  );
}
