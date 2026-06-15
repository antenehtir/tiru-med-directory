import Link from "next/link";
import { CategoryChips } from "./CategoryChips";
import { SearchAutocompleteInput } from "./SearchAutocompleteInput";

export function HealthcareSearchBox() {
  return (
    <div className="mt-6 w-full max-w-full rounded-3xl border border-border bg-card p-3 shadow-[0_16px_42px_rgba(31,41,55,0.06)] sm:mt-8 sm:p-5">
      <SearchAutocompleteInput
        id="home-healthcare-search"
        label="Reception search"
        placeholder="Search doctors, facilities, specialties, pharmacies"
        formClassName="grid min-w-0 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_auto]"
        inputClassName="min-h-13 w-full min-w-0 rounded-2xl border border-border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary sm:min-h-14 sm:px-4"
        buttonClassName="min-h-12 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover lg:min-h-14 lg:self-end"
      />

      <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/25 bg-soft-accent p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <p className="text-sm font-medium leading-6 text-foreground">
            Use your location to find nearby care.
          </p>
          <Link
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
            href="/nearby"
          >
            Find nearby care
          </Link>
        </div>
        <CategoryChips />
      </div>
    </div>
  );
}
