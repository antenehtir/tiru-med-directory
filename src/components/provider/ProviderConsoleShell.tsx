"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode, type SVGProps } from "react";

type NavItem = {
  label: string;
  href: string;
  step: number | null; // null = not subject to onboarding lock logic
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
};

function Icon(props: SVGProps<SVGSVGElement>) {
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

const OverviewIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></Icon>
);
const IdentityIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M9 8h6M9 12h6M9 16h3" /></Icon>
);
const LocationIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M12 21C12 21 5 13.5 5 8.5a7 7 0 0114 0C19 13.5 12 21 12 21z" /><circle cx="12" cy="8.5" r="2.5" /></Icon>
);
const ServicesIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M9 3v4M15 3v4M4 8h16l-1.2 11a2 2 0 01-2 1.8H7.2a2 2 0 01-2-1.8L4 8z" /></Icon>
);
const DoctorsIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M6 3v6a6 6 0 0012 0V3" /><path d="M6 3H4M18 3h2M18 15a4 4 0 01-4 4h-4" /><circle cx="18" cy="19" r="2" /></Icon>
);
const MediaIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2.2" /><path d="M21 16l-5.2-4.6a1.5 1.5 0 00-2 .05L8 16" /></Icon>
);
const SettingsIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1.04 1.56V21a2 2 0 11-4 0v-.09A1.7 1.7 0 008.96 19.36a1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.56-1.04H3a2 2 0 110-4h.09A1.7 1.7 0 004.6 8.96a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 008.96 4.6a1.7 1.7 0 001.04-1.56V3a2 2 0 114 0v.09A1.7 1.7 0 0015.04 4.6a1.7 1.7 0 001.87.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.4 8.96a1.7 1.7 0 001.56 1.04H21a2 2 0 110 4h-.09A1.7 1.7 0 0019.4 15z" /></Icon>
);
const LockIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V7a4 4 0 018 0v4" /></Icon>
);
const MenuIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M4 6h16M4 12h16M4 18h16" /></Icon>
);
const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M18 6L6 18M6 6l12 12" /></Icon>
);
const ExternalIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}><path d="M14 4h6v6M20 4l-9 9M19 13v6a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h6" /></Icon>
);

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/provider/dashboard", step: null, icon: OverviewIcon },
  { label: "Basic info", href: "/provider/onboarding/identity", step: 1, icon: IdentityIcon },
  { label: "Location", href: "/provider/onboarding/location", step: 2, icon: LocationIcon },
  { label: "Services", href: "/provider/onboarding/services", step: 3, icon: ServicesIcon },
  { label: "Doctors", href: "/provider/onboarding/doctors", step: 4, icon: DoctorsIcon },
  { label: "Photos and docs", href: "/provider/onboarding/media", step: 5, icon: MediaIcon },
];

const SETTINGS_ITEM: NavItem = { label: "Account settings", href: "/provider/settings", step: null, icon: SettingsIcon };

function StatusBadge({ status }: { status: string | null }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-400">
        ✓ Official
      </span>
    );
  }
  if (status === "pending_review") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
        Under review
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
        Needs changes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">
      Draft
    </span>
  );
}

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type SidebarContentProps = {
  facilityName: string;
  facilitySlug: string | null;
  facilityUpdatedAt: string | null;
  claimStatus: string | null;
  maxAccessibleStep: number;
  isApproved: boolean;
  pathname: string;
  onNavigate?: () => void;
};

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNavRow({
  item,
  pathname,
  locked,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  locked: boolean;
  onNavigate?: () => void;
}) {
  const isActive = isActiveRoute(pathname, item.href);
  const ItemIcon = item.icon;

  if (locked) {
    return (
      <span
        className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50"
        title="Complete previous steps first"
      >
        <ItemIcon className="size-4 shrink-0" />
        <span className="flex-1 truncate">{item.label}</span>
        <LockIcon className="size-3.5 shrink-0" />
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-foreground hover:bg-muted"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <ItemIcon className="size-4 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  );
}

function SidebarContent({
  facilityName,
  facilitySlug,
  facilityUpdatedAt,
  claimStatus,
  maxAccessibleStep,
  isApproved,
  pathname,
  onNavigate,
}: SidebarContentProps) {
  const showUnderReviewLock = claimStatus === "pending_review";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-5">
        <p className="truncate text-base font-bold text-foreground">{facilityName}</p>
        <div className="mt-2">
          <StatusBadge status={claimStatus} />
        </div>
        {facilityUpdatedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Updated {formatDate(facilityUpdatedAt)}
          </p>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Provider console">
        {NAV_ITEMS.map((item) => {
          const locked =
            item.step !== null &&
            !isApproved &&
            (showUnderReviewLock || item.step > maxAccessibleStep);

          return (
            <SidebarNavRow
              key={item.href}
              item={item}
              pathname={pathname}
              locked={locked}
              onNavigate={onNavigate}
            />
          );
        })}

        <div className="my-2 border-t border-border" />

        <SidebarNavRow
          item={SETTINGS_ITEM}
          pathname={pathname}
          locked={false}
          onNavigate={onNavigate}
        />
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-4">
        {facilitySlug && (
          <a
            href={`/facilities/${facilitySlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-950/40"
          >
            <ExternalIcon className="size-4 shrink-0" />
            View live listing
          </a>
        )}
        <a
          href="/provider/logout"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Sign out
        </a>
      </div>
    </div>
  );
}

export function ProviderConsoleShell({
  facilityName,
  facilitySlug,
  facilityUpdatedAt,
  claimStatus,
  submissionStep,
  children,
}: {
  facilityName: string;
  facilitySlug: string | null;
  facilityUpdatedAt: string | null;
  claimStatus: string | null;
  submissionStep: number | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isApproved = claimStatus === "approved";
  const currentStepFromPath = NAV_ITEMS.find(
    (item) => item.step !== null && isActiveRoute(pathname, item.href),
  )?.step;
  const maxAccessibleStep = Math.max(submissionStep ?? 0, currentStepFromPath ?? 0, 1);

  const sidebarProps: SidebarContentProps = {
    facilityName,
    facilitySlug,
    facilityUpdatedAt,
    claimStatus,
    maxAccessibleStep,
    isApproved,
    pathname,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 lg:flex">
      {/* Desktop persistent sidebar */}
      <aside className="hidden w-[220px] shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent {...sidebarProps} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">Tiru</span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            Provider
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-muted"
        >
          <MenuIcon className="size-5" />
        </button>
      </div>

      {/* Mobile slide-in drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-[80%] max-w-[300px] bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="text-base font-bold text-foreground">Tiru Provider</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <CloseIcon className="size-4" />
              </button>
            </div>
            <SidebarContent {...sidebarProps} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {isApproved && (
          <div className="flex items-center justify-center border-b border-teal-200 bg-teal-50 px-4 py-2 text-center dark:border-teal-800 dark:bg-teal-950/60">
            <p className="text-xs font-medium text-teal-800 dark:text-teal-300 sm:text-sm">
              Editing live listing — changes go live immediately.
            </p>
          </div>
        )}
        <main>{children}</main>
      </div>
    </div>
  );
}
