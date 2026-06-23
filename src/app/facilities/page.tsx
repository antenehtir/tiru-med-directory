import type { Metadata } from "next";
import { FacilitiesPage } from "@/components/facilities/FacilitiesPage";
import { PageShell } from "@/components/layout/PageShell";
import { realFacilities } from "@/data/real-facility-profiles";
import {
  filterFacilitiesByCategory,
  filterFacilitiesByQuery,
  filterFacilitiesBySpecialtyKeyword,
  getFacilityCategoryLabel,
  normalizeFacilityCategoryParam,
  normalizeSearchParam,
} from "@/lib/frontend-search-filters";

export const revalidate = 3600;

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
  const specialty =
    category === "specialty" ? normalizeSearchParam(params?.specialty) : "";
  const facilities = filterFacilitiesBySpecialtyKeyword(
    filterFacilitiesByQuery(
      filterFacilitiesByCategory(realFacilities, category),
      query,
    ),
    specialty,
  );

  return (
    <PageShell>
      <FacilitiesPage
        activeCategory={category}
        activeCategoryLabel={getFacilityCategoryLabel(category)}
        facilities={facilities}
      />
    </PageShell>
  );
}
