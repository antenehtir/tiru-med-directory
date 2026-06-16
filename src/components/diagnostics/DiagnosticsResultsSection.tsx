import Link from "next/link";
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
      {diagnostics.length > 0 ? (
        <FacilityCardGrid facilities={diagnostics} />
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">
          Diagnostics listings coming soon.{" "}
          <Link className="font-semibold text-primary" href="/register">
            Register your practice &rarr;
          </Link>
        </p>
      )}
    </section>
  );
}
