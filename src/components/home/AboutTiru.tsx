import { TiruMark } from "./TiruMark";

// id="about" is what the header's "About" link lands on — there is no separate
// about page, so the section on the homepage is the destination.
export function AboutTiru() {
  return (
    <section aria-labelledby="about-heading" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 pt-10 sm:px-6 lg:px-8 lg:pt-12" id="about">
      <div className="relative overflow-hidden rounded-3xl px-1 py-2 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-8">
        <div className="relative z-10 flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-home-mint-strong ring-1 ring-home-line lg:size-16">
            <TiruMark className="size-7 lg:size-9" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-home-muted">About Tiru</p>
            <h2 className="mt-0.5 font-serif text-xl font-semibold tracking-[-0.01em] text-home-ink sm:text-2xl" id="about-heading">
              Healthcare shouldn&apos;t be difficult to find.
            </h2>
            <p className="mt-2 max-w-lg text-[13px] leading-6 text-home-text sm:text-sm">
              Healthcare providers are everywhere, but finding the right service, specialist, test or medicine
              isn&apos;t always easy. Tiru was created to make that journey simpler. Starting in Addis Ababa, we are
              building a trusted digital layer that helps people discover and connect with healthcare.
            </p>
          </div>
        </div>
        <CitySkyline />
      </div>
    </section>
  );
}

// Generic line-art city: hills, a band of towers and low blocks, one spire.
// Drawn from primitives on purpose — no landmark, logo or real building.
function CitySkyline() {
  return (
    <svg
      aria-hidden="true"
      className="mt-6 h-32 w-full text-home-teal/45 dark:text-home-teal-bright/35 sm:h-40 lg:mt-0 lg:h-44"
      fill="none"
      preserveAspectRatio="xMidYMax meet"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.3"
      viewBox="0 0 520 170"
    >
      <path className="opacity-50" d="M0 128c40-26 70-38 110-34s62 18 96 12 64-40 110-44 78 22 112 30 60-2 92-10" />
      <path d="M4 168h512" />
      {/* low blocks */}
      <path d="M20 168v-30h34v30M28 146h6M40 146h6M28 156h6M40 156h6" />
      <path d="M60 168v-44h26v44M66 134h4M76 134h4M66 146h4M76 146h4M66 158h4M76 158h4" />
      {/* towers */}
      <path d="M94 168v-72h30v72M100 108h6M112 108h6M100 122h6M112 122h6M100 136h6M112 136h6M100 150h6M112 150h6" />
      <path d="M130 168v-54h22v54M135 124h4M144 124h4M135 138h4M144 138h4M135 152h4M144 152h4" />
      <path d="M158 168v-86l14-8 14 8v86M165 96h4M176 96h4M165 112h4M176 112h4M165 128h4M176 128h4M165 144h4M176 144h4" />
      <path d="M194 168v-40h40v40M202 138h6M214 138h6M202 152h6M214 152h6" />
      {/* spire */}
      <path d="M252 168V70l10-18 10 18v98M262 52V22M257 84h10M257 100h10M257 116h10M257 132h10M257 148h10" />
      <circle cx="262" cy="18" r="3" />
      {/* domed hall */}
      <path d="M284 168v-34h56v34M284 134c0-18 12-28 28-28s28 10 28 28M312 106v-10M298 150h8M318 150h8" />
      <path d="M348 168v-62h28v62M354 118h5M366 118h5M354 132h5M366 132h5M354 146h5M366 146h5" />
      <path d="M382 168v-94h26v94M388 86h4M398 86h4M388 102h4M398 102h4M388 118h4M398 118h4M388 134h4M398 134h4M388 150h4M398 150h4" />
      <path d="M414 168v-48h34v48M420 132h6M434 132h6M420 148h6M434 148h6" />
      <path d="M454 168v-66h24v66M459 116h4M469 116h4M459 132h4M469 132h4M459 148h4M469 148h4" />
      <path d="M484 168v-36h28v36M490 144h5M501 144h5" />
      {/* trees */}
      <path d="M236 168v-12M236 156c-6 0-8-6-4-10 1-5 7-6 8-2 5 0 6 7 2 10-2 2-4 2-6 2Z" />
      <path d="M340 168v-10M340 158c-5 0-7-5-3-8 1-4 6-5 7-1 4 0 5 6 1 8-1 1-3 1-5 1Z" />
    </svg>
  );
}
