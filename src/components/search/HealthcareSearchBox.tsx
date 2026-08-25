import { SearchAutocompleteInput } from "./SearchAutocompleteInput";

export function HealthcareSearchBox() {
  return (
    <div className="w-full max-w-full rounded-card bg-card p-3 shadow-lift sm:p-5">
      <SearchAutocompleteInput
        id="home-healthcare-search"
        label="Search healthcare"
        placeholder="Search facilities, doctors, services, or areas"
        formClassName="grid min-w-0 grid-cols-[minmax(0,1fr)_3rem] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_3.5rem] sm:gap-3"
        inputClassName="min-h-12 w-full min-w-0 rounded-control border border-border bg-input px-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary sm:min-h-14 sm:px-4"
        buttonClassName="flex size-12 shrink-0 items-center justify-center rounded-control bg-primary text-primary-foreground transition-colors hover:bg-primary-hover sm:size-14"
        labelClassName="sr-only"
        isIconButton
      />
    </div>
  );
}
