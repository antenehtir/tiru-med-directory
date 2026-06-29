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
  { label: "List your facility", href: "/provider/signup" },
  { label: "Provider login", href: "/provider/login" },
  { label: "Suggest correction", href: "/corrections" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-gradient-to-b from-background to-primary/5">
      <div className="mx-auto grid w-full max-w-6xl gap-7 px-4 py-8 pb-28 text-sm text-muted-foreground sm:px-6 sm:grid-cols-2 sm:gap-8 md:pb-8 lg:px-8">
        <nav aria-label="Footer quick links">
          <p className="font-semibold text-primary">Explore</p>
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
          <p className="font-semibold text-primary">For Healthcare Providers</p>
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
      <div className="mx-auto w-full max-w-6xl px-4 pb-6 text-xs text-primary/60 sm:px-6 lg:px-8">
        © 2025 Tiru &middot; Addis Ababa
      </div>
    </footer>
  );
}
