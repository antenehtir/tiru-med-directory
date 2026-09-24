import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { ArrowRightIcon, AssistantIcon, FlaskIcon, PillIcon } from "./home-icons";

type Feature = {
  title: string;
  body: string;
  cta: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  surface: string;
  accent: string;
  Art: () => React.JSX.Element;
};

const FEATURES: Feature[] = [
  {
    title: "Find a Test",
    body: "Find healthcare facilities and laboratories offering the test you need.",
    cta: "Search tests",
    href: "/diagnostics",
    Icon: FlaskIcon,
    surface: "bg-home-tint-care-bg",
    accent: "text-home-accent-text",
    Art: LabArt,
  },
  {
    title: "Find a Medicine",
    body: "Find pharmacies reporting availability of the medicine you are looking for.",
    cta: "Search medicines",
    href: "/pharmacies",
    Icon: PillIcon,
    surface: "bg-home-tint-meds-bg",
    accent: "text-home-tint-meds-icon",
    Art: ShelfArt,
  },
];

export function SpecificSearchSection() {
  return (
    <section aria-labelledby="specific-heading" className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <h2 className="font-serif text-2xl font-semibold tracking-[-0.01em] text-home-ink sm:text-[2rem]" id="specific-heading">
        Looking for something specific?
      </h2>

      <ul className="mt-5 grid grid-cols-2 gap-3 lg:gap-5">
        {FEATURES.map(({ title, body, cta, href, Icon, surface, accent, Art }) => (
          <li key={title}>
            <Link
              className={`group relative flex h-full items-center gap-3 overflow-hidden rounded-2xl p-3 ring-1 ring-home-line/60 transition-shadow hover:shadow-home focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal lg:items-start lg:gap-5 lg:p-7 ${surface}`}
              href={href}
            >
              <span className={`relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-home-surface ring-1 ring-home-line lg:size-14 ${accent}`}>
                <Icon className="size-5 lg:size-7" />
              </span>
              <span className="relative z-10 min-w-0 lg:max-w-[18rem]">
                <span className="block whitespace-nowrap text-[13px] font-semibold text-home-ink lg:text-lg">{title}</span>
                <span className="mt-1.5 hidden text-sm leading-6 text-home-text lg:block">{body}</span>
                <span className={`mt-3 hidden items-center gap-1.5 text-sm font-semibold lg:inline-flex ${accent}`}>
                  {cta}
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
              <ArrowRightIcon aria-hidden="true" className={`relative z-10 ml-auto hidden size-4 shrink-0 min-[400px]:block lg:hidden ${accent}`} />
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-2/5 lg:block">
                <Art />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <AskTiruCard />
    </section>
  );
}

// Not built yet. Shown so visitors know it is coming, with a real disabled
// control — no placeholder route and no fake conversation behind it.
function AskTiruCard() {
  return (
    <div className="mt-3 flex flex-col gap-4 rounded-2xl bg-home-mint p-4 ring-1 ring-home-line/70 sm:flex-row sm:items-center sm:gap-5 lg:mt-5 lg:p-6">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-home-surface text-home-deep ring-1 ring-home-line dark:text-home-teal-bright lg:size-14">
          <AssistantIcon className="size-7" />
        </span>
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-home-ink lg:text-lg">Ask Tiru</span>
            <span className="rounded-full bg-home-gold/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-home-gold dark:text-home-gold-bright">
              Coming soon
            </span>
          </p>
          <p className="mt-0.5 text-sm font-medium text-home-accent-text">Not sure where to start?</p>
          <p className="mt-1 max-w-xl text-[13px] leading-5 text-home-text lg:text-sm lg:leading-6">
            Tell us what you&apos;re looking for and we&apos;ll help you navigate the available options.
          </p>
        </div>
      </div>
      <button
        aria-describedby="ask-tiru-status"
        className="inline-flex min-h-10 shrink-0 cursor-not-allowed items-center gap-2 self-end rounded-full border border-home-line bg-home-surface px-5 text-sm font-semibold text-home-muted opacity-70 sm:self-center"
        disabled
        type="button"
      >
        Ask Tiru
        <ArrowRightIcon className="size-4" />
      </button>
      <span className="sr-only" id="ask-tiru-status">
        Ask Tiru is not available yet.
      </span>
    </div>
  );
}

// Decorative line art for the two feature cards — drawn, not photographed, so
// no stock image is implied to be a real facility.
function LabArt() {
  return (
    <svg className="h-full w-full text-home-teal/20 dark:text-home-teal-bright/15" fill="none" preserveAspectRatio="xMaxYMid meet" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" viewBox="0 0 160 120">
      <path d="M40 22h14M44 22v26L30 84a6 6 0 0 0 5.5 8h23a6 6 0 0 0 5.5-8L50 48V22" />
      <path d="M34 72h26" />
      <path d="M92 30h10M95 30v52a6 6 0 0 0 12 0V30" />
      <path d="M95 60h12" />
      <path d="M122 40h10M125 40v44a6 6 0 0 0 12 0V40" />
      <path d="M20 100h130" />
    </svg>
  );
}

function ShelfArt() {
  return (
    <svg className="h-full w-full text-home-tint-meds-icon/25" fill="none" preserveAspectRatio="xMaxYMid meet" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" viewBox="0 0 160 120">
      <path d="M20 58h130M20 100h130" />
      <rect height="26" rx="2" width="24" x="30" y="32" />
      <rect height="18" rx="2" width="20" x="60" y="40" />
      <rect height="30" rx="2" width="22" x="86" y="28" />
      <rect height="22" rx="2" width="24" x="116" y="36" />
      <rect height="24" rx="2" width="22" x="38" y="76" />
      <rect height="30" rx="2" width="26" x="68" y="70" />
      <rect height="20" rx="2" width="22" x="102" y="80" />
    </svg>
  );
}
