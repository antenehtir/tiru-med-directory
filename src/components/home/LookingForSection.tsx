import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { BuildingIcon, ChevronRightIcon, FlaskIcon, PersonIcon, PillIcon } from "./home-icons";

type Card = {
  title: string;
  description: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  tint: string;
  icon: string;
  titleColor: string;
};

const CARDS: Card[] = [
  {
    title: "Facilities",
    description: "Hospitals, clinics and specialized centers",
    href: "/facilities",
    Icon: BuildingIcon,
    tint: "bg-home-tint-care-bg",
    icon: "text-home-tint-care-icon",
    titleColor: "text-home-ink",
  },
  {
    title: "Specialists",
    description: "Find specialists by specialty and location",
    href: "/specialists",
    Icon: PersonIcon,
    tint: "bg-home-tint-people-bg",
    icon: "text-home-tint-people-icon",
    titleColor: "text-home-ink",
  },
  {
    title: "Tests",
    description: "Find laboratories and available tests",
    href: "/diagnostics",
    Icon: FlaskIcon,
    tint: "bg-home-tint-tests-bg",
    icon: "text-home-tint-tests-icon",
    titleColor: "text-home-ink",
  },
  {
    title: "Medicines",
    description: "Find pharmacies reporting medicine availability",
    href: "/pharmacies",
    Icon: PillIcon,
    tint: "bg-home-tint-meds-bg",
    icon: "text-home-tint-meds-icon",
    titleColor: "text-home-tint-meds-icon",
  },
];

export function LookingForSection() {
  return (
    <section aria-labelledby="looking-for-heading" className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <h2 className="font-serif text-2xl font-semibold tracking-[-0.01em] text-home-ink sm:text-[2rem]" id="looking-for-heading">
        What are you looking for?
      </h2>
      <ul className="mt-5 grid gap-3 lg:grid-cols-4 lg:gap-5">
        {CARDS.map(({ title, description, href, Icon, tint, icon, titleColor }) => (
          <li key={title}>
            <Link
              className={`group flex h-full items-center gap-4 rounded-2xl p-4 ring-1 ring-home-line/60 transition-all hover:-translate-y-0.5 hover:shadow-home focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal motion-reduce:transform-none lg:flex-col lg:items-start lg:gap-0 lg:p-6 ${tint}`}
              href={href}
            >
              <span className={`flex size-12 shrink-0 items-center justify-center rounded-full bg-home-surface/80 lg:size-auto lg:bg-transparent ${icon}`}>
                <Icon className="size-6 lg:size-9" />
              </span>
              <span className="min-w-0 flex-1 lg:mt-5 lg:w-full">
                <span className={`block text-base font-semibold lg:text-lg ${titleColor}`}>{title}</span>
                <span className="mt-0.5 flex items-end justify-between gap-3">
                  <span className="text-[13px] leading-5 text-home-text lg:text-sm">{description}</span>
                  <ChevronRightIcon className="hidden size-4 shrink-0 text-home-muted transition-transform group-hover:translate-x-0.5 lg:block" />
                </span>
              </span>
              <ChevronRightIcon className="size-5 shrink-0 text-home-muted lg:hidden" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
