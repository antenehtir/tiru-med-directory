import { PageContainer } from "@/components/layout/PageContainer";

const trustStats: { value: string; label: string; icon: React.ReactNode }[] = [
  {
    value: "105+",
    label: "Healthcare Providers",
    icon: (
      <svg
        aria-hidden="true"
        className="mx-auto mb-2 size-8 text-primary/60"
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
    value: "10",
    label: "Sub-cities Covered",
    icon: (
      <svg
        aria-hidden="true"
        className="mx-auto mb-2 size-8 text-primary/60"
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
    label: "Ambulance Listed",
    icon: (
      <svg
        aria-hidden="true"
        className="mx-auto mb-2 size-8 text-primary/60"
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
    <section className="mt-4 border-t border-border py-10">
      <PageContainer>
        <div className="flex gap-4">
          {trustStats.map(({ value, label, icon }) => (
            <div
              className="flex-1 rounded-2xl border border-border bg-card p-4 text-center shadow-sm"
              key={label}
            >
              {icon}
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
