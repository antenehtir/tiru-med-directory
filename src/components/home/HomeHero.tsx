import Link from "next/link";
import { SearchAutocompleteInput } from "@/components/search/SearchAutocompleteInput";
import { HeroPhoto } from "./HeroPhoto";
import { GridIcon, PinIcon, SearchIcon } from "./home-icons";

export function HomeHero() {
  return (
    <section className="relative isolate overflow-visible bg-[image:var(--home-hero)]">
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[58%] overflow-hidden lg:block">
        <HeroPhoto variant="wide" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-6 px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:min-h-[35rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-8 lg:pb-16 lg:pt-32">
        <div className="relative z-10 min-w-0">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-home-accent-text">
            Trace the right care.
          </p>

          <h1 className="font-serif text-[2.25rem] font-semibold leading-[1.04] tracking-[-0.025em] text-home-ink min-[400px]:text-[2.45rem] sm:text-5xl lg:text-[4rem]">
            Find the care you need,
            <span className="block text-home-accent-text">right now.</span>
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-7 text-home-text sm:text-lg">
            Discover facilities, specialists, tests and medicines across Addis Ababa.
          </p>

          <div className="relative mt-7 max-w-2xl rounded-2xl bg-home-surface p-2 shadow-home ring-1 ring-home-line">
            <SearchIcon className="pointer-events-none absolute left-5 top-1/2 z-10 size-[18px] -translate-y-1/2 text-home-muted" />
            <SearchAutocompleteInput
              buttonClassName="flex size-12 shrink-0 items-center justify-center rounded-xl bg-home-teal text-white transition-colors hover:bg-home-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal focus-visible:ring-offset-2 dark:bg-home-teal-bright dark:text-home-deep dark:hover:bg-home-teal"
              formClassName="grid min-w-0 grid-cols-[minmax(0,1fr)_3rem] items-center gap-2"
              id="home-hero-search"
              inputClassName="min-h-12 w-full min-w-0 text-ellipsis rounded-xl border-0 bg-transparent pl-10 pr-9 text-[15px] text-home-ink outline-none placeholder:text-home-muted focus:ring-2 focus:ring-home-teal/25 sm:text-base"
              isIconButton
              label="Search healthcare"
              labelClassName="sr-only"
              placeholder="Search a facility, specialist, service, test or medicine…"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-home-teal/35 bg-home-surface px-5 text-sm font-semibold text-home-ink transition-colors hover:border-home-teal hover:bg-home-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal"
              href="/nearby"
            >
              <PinIcon className="size-4 text-home-accent-text" />
              Find near me
            </Link>
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-home-teal/35 bg-home-surface px-5 text-sm font-semibold text-home-ink transition-colors hover:border-home-teal hover:bg-home-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal"
              href="/facilities"
            >
              <GridIcon className="size-4 text-home-accent-text" />
              Browse
            </Link>
          </div>
        </div>

        <div className="-mx-4 sm:-mx-6 lg:hidden">
          <HeroPhoto variant="inline" />
        </div>
      </div>
    </section>
  );
}
