import { PageShell } from "@/components/layout/PageShell";
import { PharmaciesPage } from "@/components/pharmacies/PharmaciesPage";
import { realFacilities } from "@/data/real-facility-profiles";
import { normalizeSearchParam } from "@/lib/frontend-search-filters";
import type { Facility } from "@/types/facility";

export const dynamic = "force-dynamic";

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
  return realFacilities.filter((facility) =>
    [facility.category, facility.subcategory, facility.name, ...facility.services]
      .join(" ")
      .toLowerCase()
      .includes("pharmacy"),
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
