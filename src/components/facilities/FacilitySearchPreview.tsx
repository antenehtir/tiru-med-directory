export function FacilitySearchPreview() {
  return (
    <section className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
      <label
        className="mb-2 block text-sm font-semibold text-foreground"
        htmlFor="facility-search-preview"
      >
        Search facilities
      </label>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          id="facility-search-preview"
          className="min-h-13 w-full rounded-md border border-border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground sm:min-h-14 sm:px-4"
          placeholder="Search clinics, hospitals, labs, diagnostic centers"
          readOnly
        />
        <button
          className="min-h-12 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm md:min-h-14"
          type="button"
        >
          Search
        </button>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Preview only. No real search or filter logic is active.
      </p>
    </section>
  );
}
