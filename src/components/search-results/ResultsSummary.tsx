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
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-semibold text-foreground">
        {totalCount} {hasQuery ? "matching" : "sample"} results
      </p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {hasQuery
          ? `Showing frontend-only matches for "${query}" across ${facilityCount} facility, ${doctorCount} doctor, and ${pharmacyCount} pharmacy previews.`
          : `Showing ${facilityCount} facility, ${doctorCount} doctor, and ${pharmacyCount} pharmacy previews from mock data.`}{" "}
        Real ranking and advanced search matching will come in a later phase.
      </p>
    </div>
  );
}
