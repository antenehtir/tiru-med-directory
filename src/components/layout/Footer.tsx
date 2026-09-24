import Link from "next/link";
import { ChevronDownIcon } from "@/components/home/home-icons";
import { ROUTES } from "@/components/navigation/navigation-items";
import { BrandMark } from "@/components/ui/BrandMark";

// Only routes that exist. The mockup's Privacy and Terms entries are left out
// until those pages exist, "About" is the homepage's about section, and there
// are no social icons because Tiru has no social accounts to link to yet.
const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Discover",
    links: [
      { label: "Find Care", href: ROUTES.facilities },
      { label: "Specialists", href: ROUTES.specialists },
      { label: "Find a Test", href: ROUTES.diagnostics },
      { label: "Find a Medicine", href: ROUTES.pharmacies },
    ],
  },
  {
    title: "For Providers",
    links: [
      { label: "List your facility", href: "/provider/signup" },
      { label: "Claim your profile", href: "/provider/claim" },
      { label: "Provider sign in", href: "/provider/login" },
      { label: "Suggest a correction", href: "/corrections" },
    ],
  },
  {
    title: "Tiru",
    links: [
      { label: "About", href: "/#about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const linkClass = "text-sm text-white/70 transition-colors hover:text-home-teal-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-home-teal-bright";

export function Footer() {
  return (
    // Stays deep green in both themes. The bottom padding below xl clears the
    // fixed mobile tab bar, which covers the last ~80px of the page there.
    <footer className="bg-home-deep font-body text-white/80">
      <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-10 sm:px-6 xl:px-8 xl:pb-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] md:gap-10">
          <div>
            <BrandMark tone="inverse" />
          </div>

          {/* md and up: open columns. */}
          {COLUMNS.map((column) => (
            <nav aria-label={column.title} className="hidden md:block" key={column.title}>
              <p className="text-sm font-semibold text-white">{column.title}</p>
              <ul className="mt-3 grid gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link className={linkClass} href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Below md: one accordion per column, native <details> so it works
              without JavaScript. */}
          <div className="divide-y divide-white/10 border-y border-white/10 md:hidden">
            {COLUMNS.map((column) => (
              <details className="group" key={column.title}>
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
                  {column.title}
                  <ChevronDownIcon className="size-4 text-white/60 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="grid gap-2 pb-4">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link className={linkClass} href={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2025 Tiru Medical Directory. All rights reserved.</p>
          <p>Made for a healthier Addis Ababa.</p>
        </div>
      </div>
    </footer>
  );
}
