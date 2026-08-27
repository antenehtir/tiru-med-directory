import { PageContainer } from "@/components/layout/PageContainer";

type TrustStatsSectionProps = {
  subCityCount: number;
  openAllHoursCount: number;
};

// The facility-count stat that used to lead this section was removed: the hero
// already states the mapped-facility count, and repeating it here was the same
// claim twice.
//
// The third stat used to read "24/7 — Ambulance Service Providers Listed".
// Exactly ONE ambulance facility exists out of 108, so presenting ambulance
// coverage as a headline strength overstated the data. It is replaced by the
// number of facilities that publish round-the-clock hours, which keeps the
// "we can help when it is urgent" signal the ambulance stat was reaching for
// while being something the data actually supports.
export function TrustStatsSection({
  subCityCount,
  openAllHoursCount,
}: TrustStatsSectionProps) {
  const trustStats = [
    {
      value: String(subCityCount),
      label: "Sub-cities covered",
      icon: (
        <svg
          aria-hidden="true"
          className="size-6 shrink-0 text-deep-muted sm:mb-2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path d="M12 2a6 6 0 016 6c0 5-6 12-6 12S6 13 6 8a6 6 0 016-6z" />
          <circle cx="12" cy="8" r="2" />
        </svg>
      ),
    },
    {
      value: String(openAllHoursCount),
      label: "Facilities open 24 hours",
      icon: (
        <svg
          aria-hidden="true"
          className="size-6 shrink-0 text-deep-muted sm:mb-2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      ),
    },
  ];

  // Mobile spacing runs 4 / 16 / 32 / 48: 4px holds the figure to its own
  // label, 16px separates the icon from that pair, 32px (py-4 on each row)
  // separates the two stats, and the section's py-12 puts 48px between the
  // band and the page. It previously ran 4 / 16 / 40 / 48, where the gap
  // between the two stats was nearly the gap between the whole band and the
  // rest of the page — so the stats read as two loose items sharing a dark
  // rectangle rather than as one group.
  return (
    // The deep band. One dark, branded anchor mid-page breaks the long run of
    // paper sections and gives the scroll a rhythm; --deep is a teal-black
    // derived from the brand accent, not generic slate.
    <section className="bg-deep py-12 sm:py-14">
      <PageContainer>
        <dl className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {trustStats.map(({ value, label, icon }) => (
            <div
              className="flex items-center gap-4 py-4 sm:flex-col sm:gap-1 sm:px-4 sm:py-0 sm:text-center"
              key={label}
            >
              {icon}
              <div className="min-w-0 sm:contents">
                <dd className="font-display text-[2rem] font-bold tabular-nums leading-none text-deep-foreground">
                  {value}
                </dd>
                <dt className="mt-1 text-[13px] leading-snug text-deep-muted sm:mt-2 sm:text-balance">
                  {label}
                </dt>
              </div>
            </div>
          ))}
        </dl>
      </PageContainer>
    </section>
  );
}
