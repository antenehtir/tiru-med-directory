import { FacilityCard } from "@/components/cards/FacilityCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { realFacilities } from "@/data/real-facility-profiles";
import { filterFacilitiesByQuery } from "@/lib/frontend-search-filters";
import { ResultsSummary } from "./ResultsSummary";
import { SearchFilterControls } from "./SearchFilterControls";
import { SearchInputPreview } from "./SearchInputPreview";
import { SearchResultsEmptyState } from "./SearchResultsEmptyState";
import { SearchResultsHeader } from "./SearchResultsHeader";

type SearchResultsPageProps = {
  focusSearch?: boolean;
  query?: string;
};

export function SearchResultsPage({
  focusSearch = false,
  query = "",
}: SearchResultsPageProps) {
  const filteredRealFacilities = filterFacilitiesByQuery(realFacilities, query);
  const filteredPharmacies = filteredRealFacilities.filter((facility) =>
    [facility.category, facility.subcategory, facility.name, ...facility.services]
      .join(" ")
      .toLowerCase()
      .includes("pharmacy"),
  );
  const filteredFacilities = filteredRealFacilities.filter(
    (facility) => !filteredPharmacies.includes(facility),
  );
  const hasQuery = query.length > 0;
  const hasResults = filteredRealFacilities.length > 0;

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <SearchResultsHeader />
        <SearchInputPreview focusSearch={focusSearch} query={query} />

        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <SearchFilterControls />

          <div className="grid gap-6">
            <ResultsSummary
              facilityCount={filteredFacilities.length}
              doctorCount={0}
              pharmacyCount={filteredPharmacies.length}
              query={query}
            />

            {hasResults ? (
              <>
                {filteredFacilities.length > 0 && (
                  <section>
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-foreground">
                          Facility results
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {hasQuery
                            ? "Facilities matching the current search."
                            : "Reviewed facility information."}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {filteredFacilities.map((facility) => (
                        <FacilityCard key={facility.id} facility={facility} />
                      ))}
                    </div>
                  </section>
                )}

                {filteredPharmacies.length > 0 && (
                  <section>
                    <div className="mb-4">
                      <h2 className="text-2xl font-semibold text-foreground">
                        Pharmacy results
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {hasQuery
                          ? "Pharmacies matching the current search."
                          : "Reviewed pharmacy information."}
                      </p>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {filteredPharmacies.map((pharmacy) => (
                        <FacilityCard key={pharmacy.id} facility={pharmacy} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            ) : (
              <SearchResultsEmptyState query={query} />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
