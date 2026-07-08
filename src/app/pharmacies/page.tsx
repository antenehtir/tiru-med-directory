import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PharmaciesPage } from "@/components/pharmacies/PharmaciesPage";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";
import { normalizeSearchParam } from "@/lib/frontend-search-filters";
import type { Facility } from "@/types/facility";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Pharmacies — Tiru",
  description: "Find pharmacies across Addis Ababa.",
};

type PharmaciesRouteProps = {
  searchParams?: Promise<{
    status?: string | string[];
  }>;
};

export default async function PharmaciesRoute({
  searchParams,
}: PharmaciesRouteProps) {
  const params = await searchParams;
  const activeStatus = normalizeSearchParam(params?.status);
  const pharmacies = filterByStatus(await getPharmaciesForRoute(), activeStatus);

  return (
    <PageShell>
      <PharmaciesPage activeStatus={activeStatus} pharmacies={pharmacies} />
    </PageShell>
  );
}

async function getPharmaciesForRoute(): Promise<Facility[]> {
  const allFacilities = await getFacilitiesFromDB();
  const exactMatches = allFacilities.filter(
    (facility) => facility.category === "Pharmacy",
  );

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  return allFacilities.filter(
    (facility) => facility.category.toLowerCase() === "pharmacy",
  );
}

function filterByStatus(pharmacies: Facility[], status: string): Facility[] {
  if (status === "open") {
    return pharmacies.filter((pharmacy) => pharmacy.isOpen);
  }

  if (status === "verified") {
    return pharmacies.filter((pharmacy) => pharmacy.verificationStatus === "verified");
  }

  return pharmacies;
}
