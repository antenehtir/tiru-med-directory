import { ChevronRightIcon } from "./home-icons";

const STEPS = [
  { title: "Find", body: "Search for a facility, specialist, test or medicine." },
  { title: "Explore", body: "Compare locations, services, availability and relevant information." },
  { title: "Connect", body: "Call, get directions or contact the healthcare provider directly." },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="rounded-3xl bg-home-mint px-4 py-7 ring-1 ring-home-line/70 sm:px-8 lg:px-10 lg:py-9">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-home-accent-text">How Tiru Health works</p>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-[-0.01em] text-home-ink sm:text-[2rem]" id="how-heading">
          Find. Explore. Connect.
        </h2>

        <ol className="relative mt-6 grid gap-3 lg:mt-8 lg:grid-cols-3 lg:gap-6">
          {STEPS.map((step, index) => (
            <li className="relative flex items-start gap-3 lg:gap-4" key={step.title}>
              {/* Mobile: a thread joining the three numbers, so the list reads
                  as a sequence rather than three separate cards. */}
              {index < STEPS.length - 1 ? (
                <span aria-hidden="true" className="absolute left-[1.05rem] top-10 h-[calc(100%-1.5rem)] w-px bg-home-line lg:hidden" />
              ) : null}
              <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-home-surface text-[13px] font-semibold tabular-nums text-home-accent-text ring-1 ring-home-teal/30 lg:size-11 lg:text-sm">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl bg-home-surface/70 px-4 py-3 ring-1 ring-home-line/70 lg:bg-transparent lg:p-0 lg:pt-1.5 lg:ring-0">
                <h3 className="text-base font-semibold text-home-ink lg:text-lg">{step.title}</h3>
                <p className="mt-1 text-[13px] leading-5 text-home-text lg:max-w-[16rem] lg:text-sm lg:leading-6">{step.body}</p>
              </div>
              {index < STEPS.length - 1 ? (
                <ChevronRightIcon aria-hidden="true" className="mt-3 hidden size-5 shrink-0 text-home-muted lg:block" />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
