import { FacilityCardGrid } from "@/components/cards/FacilityCardGrid";
import { samplePharmacies } from "@/data/samplePharmacies";
import type { Facility } from "@/types/facility";

type PharmacyResultsSectionProps = {
  pharmacies?: Facility[];
  query?: string;
};

export function PharmacyResultsSection({
  pharmacies = samplePharmacies,
  query = "",
}: PharmacyResultsSectionProps) {
  const isFiltered = query.length > 0;

  return (
    <section>
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-normal text-primary">
          Pharmacy results
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
          Sample pharmacy listings
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isFiltered
            ? `Showing pharmacy previews matching "${query}" with frontend-only sample data.`
            : "Pharmacy cards reuse the existing facility card system with frontend-only sample data."}
        </p>
      </div>
      {pharmacies.length > 0 ? (
        <FacilityCardGrid facilities={pharmacies} />
      ) : (
        <section className="rounded-lg border border-dashed border-border bg-card p-5 text-center shadow-sm">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-muted text-sm font-bold text-primary">
            0
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No pharmacy matches yet
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Try a broader pharmacy name, area, pickup term, or wellness service
            while pharmacy discovery remains frontend-only.
          </p>
        </section>
      )}
    </section>
  );
}
