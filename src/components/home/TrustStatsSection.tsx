import { PageContainer } from "@/components/layout/PageContainer";

const trustStats: { value: string; label: string; icon: React.ReactNode }[] = [
  {
    value: "105+",
    label: "Healthcare Providers",
    icon: (
      <svg
        aria-hidden="true"
        className="size-8 shrink-0 text-deep-muted sm:mb-2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <rect height="18" rx="1" width="16" x="4" y="3" />
        <path d="M9 21v-4h6v4" />
        <path d="M12 7v4M10 9h4" />
      </svg>
    ),
  },
  {
    value: "12",
    label: "Sub-cities Covered",
    icon: (
      <svg
        aria-hidden="true"
        className="size-8 shrink-0 text-deep-muted sm:mb-2"
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
    value: "24/7",
    label: "Ambulance Service Providers Listed",
    icon: (
      <svg
        aria-hidden="true"
        className="size-8 shrink-0 text-deep-muted sm:mb-2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <rect height="8" rx="1" width="13" x="2" y="9" />
        <path d="M15 11h3l3 3v3h-6" />
        <path d="M6 11v4M4 13h4" />
        <circle cx="6.5" cy="18" r="1.5" />
        <circle cx="16.5" cy="18" r="1.5" />
      </svg>
    ),
  },
];

export function TrustStatsSection() {
  return (
    // The deep band. One dark, branded anchor mid-page breaks the long run of
    // paper sections and gives the scroll a rhythm; --deep is a teal-black
    // derived from the brand accent, not generic slate.
    <section className="bg-deep py-12 sm:py-14">
      <PageContainer>
        <dl className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {trustStats.map(({ value, label, icon }) => (
            <div
              className="flex items-center gap-4 py-5 sm:flex-col sm:gap-1 sm:px-4 sm:py-0 sm:text-center"
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
