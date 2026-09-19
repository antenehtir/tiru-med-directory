// Single source of truth for admin dashboard chart series colors.
//
// The badge-distribution colors reference the exact same CSS custom
// properties Badge/Pill already render with (see src/app/globals.css and the
// mapping documented in src/lib/design-tokens.ts) via `var(--token)` rather
// than a re-derived hex copy — SVG presentation attributes support CSS
// var(), so this can't drift from the real badge color, in either theme, if
// the token is ever redefined. Add a new badge/category here by pointing it
// at its token instead of guessing a hex value.
export const BADGE_STATUS_COLORS: Record<string, string> = {
  "community-submitted": "var(--warning)",
  "facility-owned": "var(--info)",
  verified: "var(--success)",
};

export const BADGE_STATUS_LABELS: Record<string, string> = {
  "community-submitted": "Community Submitted",
  "facility-owned": "Facility Managed",
  verified: "Verified",
};

// The three series of the "New facilities and claims" chart, in stack order
// (bottom to top). Colours are the --chart-activity-* variables in
// globals.css — teal, violet and orange from the Tailwind palette the app
// already uses, with a dark-mode step for violet. The set was checked with a
// colour-vision validator in both modes: every pair stays distinct for
// colour-blind readers and each clears 3:1 against the card. Red was dropped
// for claims because red means "needs attention" elsewhere in the admin
// area. The dashboard's "Claims Pending" card uses the same orange.
export const ACTIVITY_SERIES = [
  { key: "adminAdded", label: "Added by Tiru team", color: "var(--chart-activity-team)" },
  { key: "newListings", label: "Listed by provider", color: "var(--chart-activity-listed)" },
  { key: "claims", label: "Claimed by provider", color: "var(--chart-activity-claimed)" },
] as const;
