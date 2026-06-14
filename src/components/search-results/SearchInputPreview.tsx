type SearchInputPreviewProps = {
  query?: string;
};

export function SearchInputPreview({ query = "" }: SearchInputPreviewProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(17,24,39,0.035)] sm:p-5">
      <label
        className="mb-2 block text-sm font-semibold text-foreground"
        htmlFor="search-results-preview-input"
      >
        Search healthcare
      </label>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          id="search-results-preview-input"
          className="min-h-13 w-full rounded-lg border border-border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-strong-border sm:min-h-14 sm:px-4"
          placeholder="Doctors, facilities, pharmacies, specialties"
          value={query}
          readOnly
        />
        <button
          className="min-h-12 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 md:min-h-14"
          type="button"
        >
          Search
        </button>
      </div>
    </section>
  );
}
