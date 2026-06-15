import { SearchAutocompleteInput } from "@/components/search/SearchAutocompleteInput";

type SearchInputPreviewProps = {
  focusSearch?: boolean;
  query?: string;
};

export function SearchInputPreview({
  focusSearch = false,
  query = "",
}: SearchInputPreviewProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(17,24,39,0.035)] sm:p-5">
      <SearchAutocompleteInput
        id="search-results-preview-input"
        autoFocus={focusSearch}
        initialQuery={query}
        label="Search healthcare"
        placeholder="Doctors, facilities, pharmacies, specialties"
        formClassName="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]"
        inputClassName="min-h-13 w-full min-w-0 rounded-lg border border-border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary sm:min-h-14 sm:px-4"
        buttonClassName="min-h-12 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover md:min-h-14"
      />
    </section>
  );
}
