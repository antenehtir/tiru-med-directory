import Link from "next/link";
import type { Facility } from "@/types/facility";

type FacilityCorrectionCtaProps = {
  facility: Facility;
};

export function FacilityCorrectionCta({ facility }: FacilityCorrectionCtaProps) {
  return (
    <Link
      className="mt-4 inline-flex text-sm text-muted-foreground"
      href={`/corrections?facility=${encodeURIComponent(facility.slug)}`}
    >
      Something outdated? Suggest a correction &rarr;
    </Link>
  );
}
