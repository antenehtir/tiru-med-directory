import Link from "next/link";

const quickLinks = [
  { label: "Search", href: "/search" },
  { label: "Nearby", href: "/nearby" },
  { label: "Specialists", href: "/doctors" },
  { label: "Facilities", href: "/facilities" },
  { label: "Pharmacies", href: "/pharmacies" },
  { label: "Diagnostics", href: "/diagnostics" },
];

const providerLinks = [
  { label: "Provider registration", href: "/register" },
  { label: "Suggest correction", href: "/corrections" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-7 px-4 py-8 pb-28 text-sm text-muted-foreground sm:px-6 md:grid-cols-2 md:gap-8 md:pb-8 lg:grid-cols-[1.1fr_1fr_0.8fr] lg:px-8">
        <div className="max-w-sm">
          <p className="font-medium text-foreground">Tiru</p>
          <p className="mt-2 leading-6">
            Trace the right care.
          </p>
        </div>

        <nav aria-label="Footer quick links">
          <p className="font-semibold text-foreground">Explore</p>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
            {quickLinks.map((link) => (
              <Link
                className="flex min-h-9 w-fit items-center text-muted-foreground transition-colors hover:text-primary"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <nav aria-label="Footer provider links">
          <p className="font-semibold text-foreground">Providers</p>
          <div className="mt-3 grid gap-1">
            {providerLinks.map((link) => (
              <Link
                className="flex min-h-9 w-fit items-center text-muted-foreground transition-colors hover:text-primary"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 pb-6 text-xs text-muted-foreground sm:px-6 lg:px-8">
        © 2025 Tiru &middot; Addis Ababa
      </div>
    </footer>
  );
}
