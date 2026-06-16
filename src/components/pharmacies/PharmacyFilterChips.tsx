import Link from "next/link";

const pharmacyFilters = [
  { label: "All", href: "/pharmacies", value: "" },
  { label: "Open now", href: "/pharmacies?status=open", value: "open" },
  { label: "Verified", href: "/pharmacies?status=verified", value: "verified" },
];

type PharmacyFilterChipsProps = {
  activeStatus?: string;
};

export function PharmacyFilterChips({
  activeStatus = "",
}: PharmacyFilterChipsProps) {
  return (
    <div className="flex max-w-full flex-wrap gap-2">
      {pharmacyFilters.map((filter) => {
        const isActive = filter.value === activeStatus;

        return (
          <Link
            key={filter.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-strong-border"
            }`}
            href={filter.href}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
