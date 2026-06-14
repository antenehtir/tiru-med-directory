import { FacilityCardGrid } from "@/components/cards/FacilityCardGrid";
import type { Facility } from "@/types/facility";

type DiagnosticsResultsSectionProps = {
  diagnostics?: Facility[];
};

export function DiagnosticsResultsSection({
  diagnostics = [],
}: DiagnosticsResultsSectionProps) {
  return (
    <section>
      <div className="mb-4">
        <p className="text-sm font-semibold text-muted-foreground">
          Diagnostics results
        </p>
        <h2 className="mt-2 text-2xl font-semibold leading-tight text-foreground">
          Diagnostics listings
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Real diagnostics providers from the current facility data.
        </p>
      </div>
      {diagnostics.length > 0 ? (
        <FacilityCardGrid facilities={diagnostics} />
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Diagnostics listings will be added soon.
          </h3>
        </section>
      )}
    </section>
  );
}
