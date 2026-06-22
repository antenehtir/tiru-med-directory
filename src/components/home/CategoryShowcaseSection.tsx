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

const showcaseCategories = [
  {
    cta: "Browse specialists →",
    gradient: "from-teal-600 to-teal-800",
    href: "/doctors",
    icon: StethoscopeIcon,
    subtitle: "Cardiology, Pediatrics, Dermatology and more",
    title: "Find a Specialist",
  },
  {
    cta: "Browse pharmacies →",
    gradient: "from-emerald-500 to-emerald-700",
    href: "/pharmacies",
    icon: PillIcon,
    subtitle: "Medicine access points across Addis Ababa",
    title: "Find a Pharmacy",
  },
  {
    cta: "Find ambulance →",
    gradient: "from-red-500 to-red-700",
    href: "/facilities?category=ambulance",
    icon: AmbulanceIcon,
    subtitle: "Ambulance providers across Addis Ababa",
    title: "Emergency Services",
  },
];

export function CategoryShowcaseSection() {
  return (
    <section className="bg-transparent">
      <PageContainer className="py-6 sm:py-8 lg:py-10">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Quick access
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {showcaseCategories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                className={`relative flex min-h-40 flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-6 transition-transform hover:scale-[1.02] ${category.gradient}`}
                href={category.href}
                key={category.title}
              >
                <div className="absolute -top-8 -right-8 size-32 rounded-full bg-white/10 blur-2xl" />
                <Icon className="relative z-10 size-10 text-white" />
                <div className="relative z-10">
                  <p className="text-xl font-bold text-white">
                    {category.title}
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    {category.subtitle}
                  </p>
                  <p className="mt-4 text-sm text-white/90">{category.cta}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
