import Link from "next/link";

const specialties = [
  { label: "All specialists", href: "/doctors" },
  { label: "Pediatrics", href: "/doctors?specialty=Pediatrics" },
  { label: "Cardiology", href: "/doctors?specialty=Cardiology" },
  { label: "Dermatology", href: "/doctors?specialty=Dermatology" },
  { label: "Gynecology", href: "/doctors?specialty=Gynecology" },
  { label: "Dentistry", href: "/doctors?specialty=Dentistry" },
  {
    label: "Internal medicine",
    href: "/doctors?specialty=Internal%20medicine",
  },
];

type SpecialtyFilterChipsProps = {
  activeSpecialty?: string;
};

export function SpecialtyFilterChips({
  activeSpecialty = "",
}: SpecialtyFilterChipsProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(17,24,39,0.025)]">
      <p className="text-sm font-semibold text-foreground">
        Specialty filters
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {specialties.map((specialty) => {
          const isActive = activeSpecialty
            ? specialty.label.toLowerCase() === activeSpecialty.toLowerCase()
            : specialty.label === "All specialists";

          return (
            <Link
              key={specialty.label}
              className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${
                isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-strong-border"
              }`}
              href={specialty.href}
              aria-current={isActive ? "page" : undefined}
            >
              {specialty.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
