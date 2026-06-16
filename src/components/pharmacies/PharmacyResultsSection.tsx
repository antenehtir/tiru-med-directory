import Link from "next/link";
import { FacilityCardGrid } from "@/components/cards/FacilityCardGrid";
import type { Facility } from "@/types/facility";

type PharmacyResultsSectionProps = {
  pharmacies?: Facility[];
};

export function PharmacyResultsSection({
  pharmacies = [],
}: PharmacyResultsSectionProps) {
  return (
    <section>
      {pharmacies.length > 0 ? (
        <FacilityCardGrid facilities={pharmacies} />
      ) : (
        <p className="text-sm leading-6 text-muted-foreground">
          Pharmacy listings coming soon.{" "}
          <Link className="font-semibold text-primary" href="/register">
            Register your practice &rarr;
          </Link>
        </p>
      )}
    </section>
  );
}
