import Link from "next/link";
import type { SVGProps } from "react";
import { PageContainer } from "@/components/layout/PageContainer";

function StethoscopeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M5 2v5a3 3 0 006 0V2" />
      <path d="M8 9v3a5 5 0 0010 0V9" />
      <circle cx="18" cy="9" r="1.4" />
      <circle cx="8" cy="14.5" r="2" />
    </svg>
  );
}

function PillIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      {...props}
    >
      <rect
        height="8"
        rx="4"
        transform="rotate(-45 12 12)"
        width="20"
        x="2"
        y="8"
      />
      <line
        transform="rotate(-45 12 12)"
        x1="12"
        x2="12"
        y1="4"
        y2="20"
      />
    </svg>
  );
}

function AmbulanceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="8" rx="1" width="13" x="2" y="9" />
      <path d="M15 11h3l3 3v3h-6" />
      <path d="M6 11v4M4 13h4" />
      <circle cx="6.5" cy="18" r="1.5" />
      <circle cx="16.5" cy="18" r="1.5" />
    </svg>
  );
}

function HeartPulseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

function FlaskIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11l-4 4h14l-4-4V3" />
    </svg>
  );
}

// Each tile's light stop is the Tailwind step that its --category-*-text token
// is literally set to (pharmacy #15803D = green-700, ambulance #B45309 =
// amber-700, specialty #6D28D9 = violet-700, diagnostics #0E7490 = cyan-700),
// so the row is the badge palette at display scale rather than a sixth
// independent color set — this section previously showed ambulance as red and
// diagnostics as blue. Running 700→900 instead of 500→700 also keeps five
// saturated hues from reading as a rainbow, and deepens white-text contrast.
// "Find a Specialist" isn't one of the 7 facility categories (it links to the
// doctors directory), so it stays neutral slate rather than borrowing teal.
const showcaseCategories = [
  {
    cta: "Browse specialists →",
    gradient: "from-slate-700 to-slate-900",
    href: "/doctors",
    icon: StethoscopeIcon,
    subtitle: "Cardiology, Pediatrics, Dermatology and more",
    title: "Find a Specialist",
  },
  {
    cta: "Browse pharmacies →",
    gradient: "from-green-700 to-green-900",
    href: "/pharmacies",
    icon: PillIcon,
    subtitle: "Medicine access points across Addis Ababa",
    title: "Find a Pharmacy",
  },
  {
    cta: "Find ambulance →",
    gradient: "from-amber-700 to-amber-900",
    href: "/facilities?category=ambulance",
    icon: AmbulanceIcon,
    subtitle: "Ambulance providers across Addis Ababa",
    title: "Emergency Services",
  },
  {
    cta: "Browse specialty centers →",
    gradient: "from-violet-700 to-violet-900",
    href: "/facilities?category=specialty",
    icon: HeartPulseIcon,
    subtitle: "Focused specialist units across Addis Ababa",
    title: "Specialty Centers",
  },
  {
    cta: "Find diagnostics →",
    gradient: "from-cyan-700 to-cyan-900",
    href: "/diagnostics",
    icon: FlaskIcon,
    subtitle: "Labs, imaging and diagnostic centers",
    title: "Diagnostics",
  },
];

export function CategoryShowcaseSection() {
  return (
    <section className="bg-transparent">
      <PageContainer className="py-8 sm:py-10 lg:py-12">
        <h2 className="mb-5 font-display text-[2rem] font-semibold leading-[1.1] text-foreground">
          Quick access
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {showcaseCategories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                className={`group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-card bg-gradient-to-br p-6 transition-transform duration-200 hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none lg:min-h-48 ${category.gradient}`}
                href={category.href}
                key={category.title}
                prefetch={true}
              >
                <div className="absolute -top-8 -right-8 size-32 rounded-full bg-white/10 blur-2xl" />
                <Icon className="relative z-10 size-9 text-white/90" />
                <div className="relative z-10">
                  <p className="font-display text-xl font-semibold leading-tight text-white">
                    {category.title}
                  </p>
                  <p className="mt-1.5 text-[13px] leading-snug text-white/75">
                    {category.subtitle}
                  </p>
                  <p className="mt-4 text-[13px] font-medium text-white">
                    {category.cta}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
