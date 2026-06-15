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
        formClassName="grid min-w-0 grid-cols-[minmax(0,1fr)_3rem] items-end gap-2 sm:grid-cols-[minmax(0,1fr)_3.5rem] sm:gap-3"
        inputClassName="min-h-12 w-full min-w-0 rounded-2xl border border-border bg-input px-3 text-base text-foreground outline-none placeholder:text-muted-foreground focus:border-primary sm:min-h-14 sm:px-4"
        buttonClassName="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition hover:bg-primary-hover sm:size-14"
        labelClassName="sr-only"
        isIconButton
      />

      <div className="mt-3 grid gap-3 sm:mt-4">
        <Link
          className="mx-auto inline-flex min-h-11 w-full max-w-[21rem] items-center justify-center rounded-2xl border border-primary/30 bg-soft-accent px-4 text-center text-sm font-semibold text-primary shadow-[0_0_0_1px_rgba(20,184,166,0.06),0_10px_26px_rgba(15,118,110,0.10)] transition hover:border-primary/50 hover:bg-primary hover:text-primary-foreground sm:w-auto sm:min-w-64"
          href="/nearby"
        >
          Find nearby care
        </Link>
        <CategoryChips />
      </div>
    </div>
  );
}
