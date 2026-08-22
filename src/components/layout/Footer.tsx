import Link from "next/link";
import { ROUTES } from "@/components/navigation/navigation-items";

const quickLinks = [
  { label: "Search", href: ROUTES.search },
  { label: "Nearby", href: ROUTES.nearby },
  { label: "Specialists", href: ROUTES.specialists },
  { label: "Facilities", href: ROUTES.facilities },
  { label: "Pharmacies", href: ROUTES.pharmacies },
  { label: "Diagnostics", href: ROUTES.diagnostics },
];

const providerLinks = [
  { label: "List your facility", href: "/provider/signup" },
  { label: "Provider login", href: "/provider/login" },
  { label: "Suggest correction", href: "/corrections" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-footer-background">
      <div className="mx-auto grid w-full max-w-6xl gap-7 px-4 py-10 pb-28 text-sm text-footer-muted sm:px-6 sm:grid-cols-2 sm:gap-8 md:pb-10 lg:px-8">
        <nav aria-label="Footer quick links">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-footer-foreground">
            Explore
          </p>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1">
            {quickLinks.map((link) => (
              <Link
                className="flex min-h-9 w-fit items-center text-footer-muted transition-colors hover:text-footer-accent"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <nav aria-label="Footer provider links">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-footer-foreground">
            For Healthcare Providers
          </p>
          <div className="mt-3 grid gap-1">
            {providerLinks.map((link) => (
              <Link
                className="flex min-h-9 w-fit items-center text-footer-muted transition-colors hover:text-footer-accent"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
      <div className="mx-auto w-full max-w-6xl border-t border-white/10 px-4 pb-6 pt-4 text-xs text-footer-muted sm:px-6 lg:px-8">
        © 2025 Tiru &middot; Addis Ababa
      </div>
    </footer>
  );
}
