import { SearchAutocompleteInput } from "@/components/search/SearchAutocompleteInput";
import { ArrowRightIcon, SearchIcon } from "./home-icons";

// The same autocomplete as the hero, with its own id so the two fields never
// share a listbox.
export function ClosingSearchBand() {
  return (
    <section aria-labelledby="closing-heading" className="mx-auto w-full max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-12">
      <div className="relative overflow-hidden rounded-3xl bg-home-deep px-5 py-8 text-center sm:px-10 lg:py-10">
        <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-home-teal/30 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-10 size-72 rounded-full bg-home-teal-bright/10 blur-3xl" />
        <h2 className="relative mx-auto max-w-md text-left font-serif text-2xl font-semibold leading-tight text-white sm:max-w-none sm:text-center sm:text-[1.75rem]" id="closing-heading">
          The right care may be closer than you think.
        </h2>
        <p className="relative mt-1.5 text-left text-sm text-white/75 sm:text-center">Search healthcare in Addis Ababa.</p>
        <div className="relative mx-auto mt-5 max-w-2xl rounded-2xl bg-white p-1.5 text-left shadow-lg dark:bg-home-surface">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 z-10 size-[18px] -translate-y-1/2 text-home-muted" />
          <SearchAutocompleteInput
            buttonClassName="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-home-deep px-3 text-sm font-semibold text-white ring-1 ring-home-teal/40 transition-colors hover:bg-home-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal sm:px-4 dark:bg-home-teal-bright dark:text-home-deep dark:hover:bg-home-teal"
            buttonContent={
              <>
                <span className="hidden sm:inline">Start searching</span>
                <ArrowRightIcon className="hidden size-4 sm:block" />
                <SearchIcon className="size-5 sm:hidden" />
              </>
            }
            buttonLabel="Start searching"
            formClassName="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2"
            id="home-closing-search"
            inputClassName="min-h-11 w-full min-w-0 text-ellipsis rounded-xl border-0 bg-transparent pl-10 pr-9 text-[15px] text-home-ink outline-none placeholder:text-home-muted focus:ring-2 focus:ring-home-teal/25"
            label="Search healthcare in Addis Ababa"
            labelClassName="sr-only"
            placeholder="Search a facility, specialist, service, test or medicine…"
          />
        </div>
      </div>
    </section>
  );
}
