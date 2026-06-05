import { DoctorCard } from "@/components/cards/DoctorCard";
import { FacilityCard } from "@/components/cards/FacilityCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { sampleDoctors } from "@/data/sampleDoctors";
import { sampleFacilities } from "@/data/sampleFacilities";
import { samplePharmacies } from "@/data/samplePharmacies";
import {
  filterDoctorsByQuery,
  filterFacilitiesByQuery,
} from "@/lib/frontend-search-filters";
import { ResultsSummary } from "./ResultsSummary";
import { SearchFilterControls } from "./SearchFilterControls";
import { SearchInputPreview } from "./SearchInputPreview";
import { SearchResultsEmptyState } from "./SearchResultsEmptyState";
import { SearchResultsHeader } from "./SearchResultsHeader";

type SearchResultsPageProps = {
  query?: string;
};

export function SearchResultsPage({ query = "" }: SearchResultsPageProps) {
  const filteredFacilities = filterFacilitiesByQuery(sampleFacilities, query);
  const filteredDoctors = filterDoctorsByQuery(sampleDoctors, query);
  const filteredPharmacies = filterFacilitiesByQuery(samplePharmacies, query);
  const hasQuery = query.length > 0;
  const hasResults =
    filteredFacilities.length + filteredDoctors.length + filteredPharmacies.length >
    0;

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <SearchResultsHeader />
        <SearchInputPreview query={query} />

        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <SearchFilterControls />

          <div className="grid gap-6">
            <ResultsSummary
              facilityCount={filteredFacilities.length}
              doctorCount={filteredDoctors.length}
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
                            ? "Facility previews matching the current search."
                            : "Sample facility cards using the reusable card system."}
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

                {filteredDoctors.length > 0 && (
                  <section>
                    <div className="mb-4">
                      <h2 className="text-2xl font-semibold text-foreground">
                        Doctor results
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {hasQuery
                          ? "Doctor previews matching the current search."
                          : "Sample doctor cards using the reusable doctor card system."}
                      </p>
                    </div>
                    <div className="grid gap-4 xl:grid-cols-2">
                      {filteredDoctors.map((doctor) => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
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
                          ? "Pharmacy previews matching the current search."
                          : "Sample pharmacy cards using frontend-only data."}
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

            {!hasQuery && (
              <div className="rounded-lg border border-dashed border-border bg-card p-5 text-center shadow-sm">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-muted text-sm font-bold text-primary">
                  0
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  No-result state preview
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  When a search has no matches, this area becomes a friendly
                  empty state with broader discovery guidance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
