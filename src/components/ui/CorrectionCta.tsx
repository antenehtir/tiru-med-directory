import Link from "next/link";

type CorrectionCtaProps = {
  // The corrections flow resolves listings by FACILITY slug. Specialists live
  // inside their facility's `doctors` record, so specialist pages pass their
  // facility's slug here.
  facilitySlug: string;
};

export function CorrectionCta({ facilitySlug }: CorrectionCtaProps) {
  return (
    <Link
      className="inline-flex text-sm text-muted-foreground hover:text-foreground"
      href={`/corrections?facility=${encodeURIComponent(facilitySlug)}`}
    >
      Something outdated? Suggest a correction &rarr;
    </Link>
  );
}
