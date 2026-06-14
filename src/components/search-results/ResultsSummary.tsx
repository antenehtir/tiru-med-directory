type ResultsSummaryProps = {
  facilityCount: number;
  doctorCount: number;
  pharmacyCount: number;
  query?: string;
};

export function ResultsSummary({
  facilityCount,
  doctorCount,
  pharmacyCount,
  query = "",
}: ResultsSummaryProps) {
  const totalCount = facilityCount + doctorCount + pharmacyCount;
  const hasQuery = query.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(17,24,39,0.025)]">
      <p className="text-sm font-semibold text-foreground">
        {totalCount} {hasQuery ? "matching" : "available"} results
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {hasQuery
          ? `Showing matches for "${query}" across ${facilityCount} facility, ${doctorCount} doctor, and ${pharmacyCount} pharmacy listings.`
          : `Showing ${facilityCount} facility, ${doctorCount} doctor, and ${pharmacyCount} pharmacy listings.`}{" "}
        Information is reviewed before publication.
      </p>
    </div>
  );
}
