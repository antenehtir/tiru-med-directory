import { PageContainer } from "@/components/layout/PageContainer";

const trustStats: { label: string; icon: React.ReactNode }[] = [
  {
    label: "100+ Healthcare Listings",
    icon: (
      <svg
        aria-hidden="true"
        className="size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path d="M9 6h10M9 12h10M9 18h10M4 6h.01M4 12h.01M4 18h.01" />
      </svg>
    ),
  },
  {
    label: "Citywide Addis Coverage",
    icon: (
      <svg
        aria-hidden="true"
        className="size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path d="M12 2a6 6 0 016 6c0 5-6 12-6 12S6 13 6 8a6 6 0 016-6z" />
        <circle cx="12" cy="8" r="2" />
      </svg>
    ),
  },
  {
    label: "Reviewed Before Publishing",
    icon: (
      <svg
        aria-hidden="true"
        className="size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        viewBox="0 0 24 24"
      >
        <path d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
];

export function TrustStatsSection() {
  return (
    <section className="mt-4 border-t border-border">
      <PageContainer className="py-8">
        <div className="flex flex-wrap justify-center gap-3">
          {trustStats.map(({ label, icon }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700"
            >
              {icon}
              {label}
            </span>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
