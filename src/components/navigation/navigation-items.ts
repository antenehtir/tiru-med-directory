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

export const mainNavigationItems = [
  { label: "Home", href: ROUTES.home },
  { label: "Search", href: ROUTES.search },
  { label: "Nearby", href: ROUTES.nearby },
  { label: "Specialists", href: ROUTES.specialists },
  { label: "Facilities", href: ROUTES.facilities },
];

export const mobileNavigationItems = [
  { label: "Home", href: ROUTES.home, shortLabel: "Home" },
  { label: "Search", href: ROUTES.search, shortLabel: "Search" },
  { label: "Nearby", href: ROUTES.nearby, shortLabel: "Nearby" },
  { label: "Facilities", href: ROUTES.facilities, shortLabel: "Facility" },
  { label: "Specialists", href: ROUTES.specialists, shortLabel: "Specialists" },
];
