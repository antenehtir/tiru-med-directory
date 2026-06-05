import { PageShell } from "@/components/layout/PageShell";
import { PharmaciesPage } from "@/components/pharmacies/PharmaciesPage";
import { samplePharmacies } from "@/data/samplePharmacies";
import {
  filterFacilitiesByQuery,
  normalizeSearchParam,
} from "@/lib/frontend-search-filters";

type PharmaciesRouteProps = {
  searchParams?: Promise<{
    q?: string | string[];
  }>;
};

export default async function PharmaciesRoute({
  searchParams,
}: PharmaciesRouteProps) {
  const params = await searchParams;
  const query = normalizeSearchParam(params?.q);
  const pharmacies = filterFacilitiesByQuery(samplePharmacies, query);

  return (
    <PageShell>
      <PharmaciesPage activeQuery={query} pharmacies={pharmacies} />
    </PageShell>
  );
}
