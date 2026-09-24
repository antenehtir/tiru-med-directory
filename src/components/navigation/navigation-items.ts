// Single source of truth for canonical public content routes — every nav
// surface (desktop header, mobile bottom bar, footer) should reference these
// constants instead of retyping path strings, so a future route rename can't
// silently leave one surface pointing at a stale path (as happened when
// /doctors was replaced by /specialists: the footer and mobile nav each kept
// their own hardcoded "/doctors" long after the desktop nav was updated).
export const ROUTES = {
  home: "/",
  search: "/search",
  nearby: "/nearby",
  specialists: "/specialists",
  facilities: "/facilities",
  pharmacies: "/pharmacies",
  diagnostics: "/diagnostics",
} as const;

export type HeaderNavLink = { label: string; href: string; description?: string };
export type HeaderNavItem =
  | { label: string; href: string }
  // `match` lists the path prefixes that light the trigger up as current.
  | { label: string; items: HeaderNavLink[]; match: string[] };

// The header's primary navigation. Every dropdown entry is an existing route
// or an existing filter on one (category/subtype/status query parameters the
// list pages already read) — nothing points at a page that does not exist.
// "About" is the homepage's own about section; there is no /about page.
export const headerNavigationItems: HeaderNavItem[] = [
  { label: "Home", href: ROUTES.home },
  {
    label: "Find Care",
    match: [ROUTES.facilities, ROUTES.nearby, ROUTES.search],
    items: [
      { label: "All facilities", href: ROUTES.facilities, description: "Hospitals, clinics and specialized centers" },
      { label: "Hospitals", href: `${ROUTES.facilities}?category=hospital` },
      { label: "Specialty centers", href: `${ROUTES.facilities}?category=specialty` },
      { label: "Near me", href: ROUTES.nearby, description: "Sorted by distance from you" },
    ],
  },
  {
    label: "Find a Test",
    match: [ROUTES.diagnostics],
    items: [
      { label: "All diagnostics", href: ROUTES.diagnostics, description: "Laboratories and imaging centers" },
      { label: "Laboratories", href: `${ROUTES.diagnostics}?subtype=laboratory` },
      { label: "Imaging", href: `${ROUTES.diagnostics}?subtype=imaging` },
    ],
  },
  {
    label: "Find a Medicine",
    match: [ROUTES.pharmacies],
    items: [
      { label: "All pharmacies", href: ROUTES.pharmacies, description: "Pharmacies across Addis Ababa" },
      { label: "Open now", href: `${ROUTES.pharmacies}?status=open` },
    ],
  },
  { label: "Specialists", href: ROUTES.specialists },
  { label: "About", href: "/#about" },
];

export const mobileNavigationItems = [
  { label: "Home", href: ROUTES.home, shortLabel: "Home" },
  { label: "Search", href: ROUTES.search, shortLabel: "Search" },
  { label: "Nearby", href: ROUTES.nearby, shortLabel: "Nearby" },
  // Plural, like every other tab and like the desktop label for the same
  // route. "Facility" read as one particular facility — yours — which is a
  // different page in a different section of the site, and it sat under an
  // add-shaped icon saying the same wrong thing.
  { label: "Facilities", href: ROUTES.facilities, shortLabel: "Facilities" },
  { label: "Specialists", href: ROUTES.specialists, shortLabel: "Specialists" },
];
