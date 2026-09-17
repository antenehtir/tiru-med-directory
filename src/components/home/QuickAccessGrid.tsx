import Link from "next/link";
import type { SVGProps } from "react";
import { facilityCategoryIcons } from "@/components/facilities/category-icons";
import { PageContainer } from "@/components/layout/PageContainer";

function IconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      {...props}
    />
  );
}

// Same figure the Specialists bottom-nav tab already draws — a stethoscope,
// not a generic person icon, kept visually consistent with the tab this card
// is a shortcut to rather than inventing a second mark for the same idea.
function SpecialistIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M6 3v6a6 6 0 006 6 6 6 0 006-6V3" />
      <path d="M6 3H4M18 3h2M18 15a4 4 0 01-4 4H10" />
      <circle cx="18" cy="19" r="2" />
    </IconBase>
  );
}

// Same mark EmergencyLink already uses in the header, for the same reason —
// one shortcut, one glyph.
function EmergencyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M12 8v8M8 12h8" />
      <circle cx="12" cy="12" r="9" />
    </IconBase>
  );
}

type QuickAccessCard = {
  label: string;
  description: string;
  href: string;
  // Fixed Tailwind stock-palette classes rather than the theme's own
  // --category-*-text tokens: those are calibrated to sit ON this app's
  // background as small text/icon accents, and flip to a pale tint in dark
  // mode for exactly that reason — filled in as a solid card background they
  // would wash out to a near-white tile with barely-visible text. A solid
  // brand-accent tile is deliberately theme-fixed here, the same way the
  // WhatsApp/Facebook/TikTok badge colors elsewhere in this app don't flip
  // either. The hue picked for each card still matches that category's
  // existing token family (blue for hospital, violet for specialty, teal for
  // clinic/specialist, cyan for diagnostics, green for pharmacy) — bolder,
  // not different.
  gradientClassName: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
};

const CARDS: QuickAccessCard[] = [
  {
    label: "Hospitals",
    description: "Full-service private hospitals",
    href: "/facilities?category=hospital",
    gradientClassName: "from-blue-600 to-blue-700",
    icon: facilityCategoryIcons.hospital,
  },
  {
    label: "Specialists",
    description: "Cardiology, pediatrics, dermatology and more",
    href: "/specialists",
    gradientClassName: "from-teal-600 to-teal-700",
    icon: SpecialistIcon,
  },
  {
    label: "Pharmacies",
    description: "Medicine access points across Addis Ababa",
    href: "/facilities?category=pharmacy",
    gradientClassName: "from-green-600 to-green-700",
    icon: facilityCategoryIcons.pharmacy,
  },
  {
    label: "Emergency",
    description: "Ambulance providers, reachable now",
    href: "/facilities/tebita-ambulance",
    gradientClassName: "from-red-600 to-red-700",
    icon: EmergencyIcon,
  },
  {
    label: "Specialty Centers",
    description: "Focused care and multi-specialty units",
    href: "/facilities?category=specialty",
    gradientClassName: "from-violet-600 to-violet-700",
    icon: facilityCategoryIcons.specialty,
  },
  {
    label: "Diagnostics (Lab/Imaging)",
    description: "Labs, imaging, and diagnostic tests",
    href: "/facilities?category=diagnostics",
    gradientClassName: "from-cyan-600 to-cyan-700",
    icon: facilityCategoryIcons.diagnostics,
  },
];

// Six curated shortcuts, distinct from DiscoveryRow's "Browse by category"
// chip row further down the page: that row is the exhaustive list (fifteen-
// plus categories and specialties, scrollable), this is the handful of
// things most visitors want on arrival, given the visual weight a card
// carries that a chip cannot. Hospitals earns a card of its own — the
// reference this was modelled on covered Specialists, Pharmacies, Emergency
// and Specialty Centers but not the single most-searched-for category on
// the whole site.
export function QuickAccessGrid() {
  return (
    <section aria-labelledby="quick-access-heading" className="bg-transparent">
      <PageContainer className="py-6 sm:py-8">
        <h2 className="sr-only" id="quick-access-heading">Quick access</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-5 ${card.gradientClassName}`}
                href={card.href}
                key={card.label}
              >
                {/* Ambient highlight, not a second brand color — pure white
                    at low opacity so it reads as a light catching the tile
                    rather than as a decoration competing with the icon. */}
                <span aria-hidden="true" className="pointer-events-none absolute -right-5 -top-5 size-20 rounded-full bg-white/10 transition-transform duration-150 group-hover:scale-110" />
                <Icon className="relative size-6 sm:size-7" />
                <p className="relative mt-2.5 font-display text-sm font-semibold leading-tight sm:text-base">
                  {card.label}
                </p>
                <p className="relative mt-0.5 text-[11px] leading-snug text-white/85 sm:text-xs">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
