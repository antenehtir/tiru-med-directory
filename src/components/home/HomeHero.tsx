import Link from "next/link";
import { SearchAutocompleteInput } from "@/components/search/SearchAutocompleteInput";
import { HeroPhoto } from "./HeroPhoto";
import { GridIcon, PinIcon, SearchIcon } from "./home-icons";

// The search field is the existing autocomplete (suggestions, ghost text,
// submit to /search?q=), restyled — not a second search implementation.
export function HomeHero() {
  return (
    // overflow stays visible so the search suggestions can drop below the
    // hero; the photo carries its own clipping box instead.
    <section className="relative isolate overflow-visible bg-[image:var(--home-hero)]">
      {/* Desktop: the photo fills the right side of the hero, edge to edge,
          and fades into the gradient under the headline. */}
      <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[58%] overflow-hidden lg:block">
        <HeroPhoto variant="wide" />
      </div>
      <div className="mx-auto grid w-full max-w-7xl items-center gap-6 px-4 pb-8 pt-7 sm:px-6 sm:pt-10 lg:min-h-[31rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-8 lg:pb-14 lg:pt-12">
        <div className="relative z-10 min-w-0">
          <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-home-accent-text">
            <span aria-hidden="true" className="h-px w-5 bg-current" />
            Trace the right care.
          </p>
          {/* 1.8rem on phones keeps "Find the care you need," on one line at
              390px, as in the mobile mockup; at 2.35rem it broke after "you". */}
          <h1 className="mt-3 font-serif text-[1.8rem] font-semibold leading-[1.08] tracking-[-0.02em] text-home-ink min-[400px]:text-[2rem] sm:text-5xl lg:text-[3.4rem]">
            Find the care you need,
            <span className="block text-home-accent-text">right now.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-7 text-home-text sm:text-lg">
            Discover facilities, specialists, tests and medicines across Addis Ababa.
          </p>

          <div className="relative mt-6 max-w-xl rounded-2xl bg-home-surface p-2 shadow-home ring-1 ring-home-line">
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

        {/* Phone and tablet: in flow under the buttons, fading on every side. */}
        <div className="-mx-4 sm:-mx-6 lg:hidden">
          <HeroPhoto variant="inline" />
        </div>
      </div>
    </section>
  );
}
