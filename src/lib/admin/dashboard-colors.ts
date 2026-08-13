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
  "facility-owned": "Official",
  verified: "Verified",
};

// No existing semantic token distinguishes "claim on an existing facility"
// vs. "brand-new listing request" elsewhere in the app (the Provider
// Submissions tabs use plain selected/muted Pill states, not fixed colors)
// — these match the dashboard's own Listing Requests / Claims Pending stat
// card accents (text-violet-600 / text-rose-600) instead, the closest
// existing color association for these two categories.
export const SUBMISSION_SERIES_COLORS = {
  newListings: "#7C3AED", // violet-600 — dashboard "Listing Requests" stat card
  claims: "#E11D48", // rose-600 — dashboard "Claims Pending" stat card
};
