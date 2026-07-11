/**
 * Tiru Medical Directory — Design System Reference
 *
 * This file is the SINGLE source of truth for design tokens and their
 * intended usage. When building new UI, refer to this file. When existing
 * code diverges, this file wins.
 *
 * Sections:
 *   1. Semantic color tokens
 *   2. Typography scale
 *   3. Spacing rhythm
 *   4. Component reference (Pill, Badge)
 *   5. Outstanding conversions (files still using inline styles)
 *   6. Audit notes (outliers found, tracked for future phases)
 */

// ─── 1. SEMANTIC COLOR TOKENS ────────────────────────────────────────────────
//
// All tokens are defined in src/app/globals.css as CSS custom properties
// and wired into Tailwind v4 via the @theme inline block.
//
// MAPPING — semantic intent → CSS variable → light value → dark value
// ──────────────────────────────────────────────────────────────────────
//
// primary     --primary              #0F766E (teal-700)    #14B8A6 (teal-400)
//   USAGE: CTAs, active states, links, focus rings, Official badge (target),
//          Step progress indicators, onboarding highlight text.
//   NOTE:  --primary-hover also defined for interactive states.
//
// warning     --warning (text only)  #B7791F (amber-700)   #FBBF24 (amber-400)
//   USAGE: Pre-approval states, CS badge, "Required for approval" tags,
//          "Under review" indicators, unverified phone cross-check background.
//   NOTE:  Only the text/foreground color is a named token. Background and border
//          use Tailwind's amber-50/amber-200 directly in Pill/Badge components.
//          Intentional: amber covers both "attention-needed" and "pre-approval"
//          states (CS badge, pending_review flag, required tags) — this is
//          correct design intent, not an inconsistency.
//
// danger      --error (text only)    #B42318 (red-700)     #FCA5A5 (red-300)
//   USAGE: Expired states, error messages, deactivation, rejection, Inactive
//          status in admin table. Note: CSS variable is named "--error", not
//          "--danger" — use `text-error` Tailwind utility; Pill/Badge use
//          `variant="danger"` which maps to red-* classes internally.
//
// success     --success (BROKEN)     #0F766E (teal!)       #14B8A6 (teal!)
//   ⚠ BUG: --success is currently mapped to the SAME teal as --primary. This
//          is semantically wrong — success should be green/emerald. It is NOT
//          renamed here (that would cascade breaks). Instead, Pill/Badge use
//          Tailwind's emerald-* classes for variant="success". The CSS variable
//          `text-success` should NOT be used for "success" UI states until the
//          token is corrected in a dedicated token-fix commit.
//   USAGE (intended): "Available now" indicators, approved status, checkmarks,
//          Active facility status, Open now badge, license "On file" labels.
//
// info        [MISSING — no CSS variable defined]
//   STATUS: The "info" semantic slot has no CSS custom property. Pill/Badge use
//          Tailwind blue-* hardcoded classes for variant="info".
//   USAGE: Non-warning informational chips used sparingly. Currently used for
//          the Official badge (blue) — but the TARGET is to move Official to
//          `primary` (teal) to align with brand. Official = blue is a
//          transitional state; a later phase will convert it to `primary`.
//   TODO:  Add --info token to globals.css (blue-700 / blue-300 for dark).
//
// muted       --muted / --muted-foreground   #F3F4F6 / #6B7280
//   USAGE: Neutral chips, secondary text, disabled states, "Not uploaded" tags,
//          Closed now badge, unselected filter pills.
//
// ─── INCONSISTENCIES TO FIX IN FUTURE PHASES ────────────────────────────────
//
// - Official badge: currently blue (info) in some places, teal (primary) in
//   others (e.g. VerificationBadge vs SpecialistCard). TARGET: all = primary.
//   FIX IN: Phase 1 (trust badges convergence).
//
// - VerificationBadge uses hardcoded hex values (#A7F3D0, #ECFDF5, #0F766E)
//   instead of Tailwind classes or CSS tokens. FIX IN: Phase 1.
//
// - MilestoneCard, Step5MediaForm, Step6ReviewForm use hardcoded hex colors
//   (#A7F3D0, #ECFDF5 etc.) matching the --soft-accent/emerald palette but not
//   using Tailwind classes. FIX IN: Phase 2 (provider onboarding refinement).
//
// - CorrectionsPage, FeedbackPage use inline text-[#0F766E] instead of
//   text-primary. FIX IN: Phase 1 (quick wins sweep).

export type ColorVariant =
  | "primary"
  | "warning"
  | "danger"
  | "success"
  | "info"
  | "muted";

// ─── 2. TYPOGRAPHY SCALE ─────────────────────────────────────────────────────
//
// Tailwind's default scale is used as-is. These are the SEMANTIC ASSIGNMENTS:
//
//   text-xs   (12px) — timestamps, small pills, meta labels, table sub-text
//   text-sm   (14px) — body default, form labels, card body text, descriptions
//   text-base (16px) — emphasized body, doctor names, larger card text
//   text-lg   (18px) — section sub-headings (h4 equiv), sidebar section titles
//   text-xl   (20px) — card titles, section headings (h3), form card headers
//   text-2xl  (24px) — page section titles (h2), e.g. "Meet the specialists"
//   text-3xl  (30px) — page hero headings (h1) at mobile breakpoint
//
// RESPONSIVE PATTERN for hero headings:
//   text-3xl sm:text-4xl — standard hero h1 (most listing pages)
//   text-3xl sm:text-4xl — facility detail h1 (same)
//   EXCEPTION: Main home page hero uses text-[2.15rem] sm:text-5xl — intentional
//              to achieve the larger impact heading. Document but leave as-is.
//
// AUDIT — OUTLIERS FOUND (do not fix in this commit):
//   sm:text-4xl — used as responsive UP from text-3xl in hero h1s. This is
//                 intentional and fine; not an outlier, it's the pattern.
//   text-5xl    — HeroSearchSection home page only. Intentional one-off for
//                 the largest heading on the site. Leave as-is.
//   text-[2.15rem] — HeroSearchSection home, paired with text-5xl. One-off.
//   text-[11px] — SignInMenu section label (tiny uppercase tracking label).
//                 FIX IN: Phase 1, replace with text-xs tracking-wider.
//   text-[10px] — MobileBottomNavigation labels, SpecialistCard Official badge.
//                 FIX IN: Phase 1. Use text-[10px] → text-xs (close enough).
//   text-[0.68rem] — BrandMark sub-label. Design intentional; leave as-is.
//   text-[1.45rem] — BrandMark name. Design intentional; leave as-is.
//   text-[1.6rem] — BrandMark responsive. Design intentional; leave as-is.
//   text-[#0F766E] (color, not size) — CorrectionsPage, FeedbackPage.
//                 FIX IN: Phase 1, replace with text-primary.

// ─── 3. SPACING RHYTHM ───────────────────────────────────────────────────────
//
// CARD PADDING:
//   p-5  (20px) — regular cards, most UI panels
//   p-6  (24px) — hero/emphasis cards (FacilityDetailHeader, ActionPanel)
//   p-4  (16px) — compact contexts: table rows, inner detail boxes ONLY
//   EXCEPTION: p-8 on FacilityDetailHeader at lg: breakpoint (hero + large viewport)
//
// SECTION GAPS:
//   gap-4  (16px) — between related items (pill groups, language tags)
//   gap-6  (24px) — between distinct sections within a card
//   gap-8  (32px) — between top-level page sections (rarely used inline; usually
//                   achieved by space-y-8 on the page wrapper)
//
// BORDER RADIUS — CANONICAL:
//   rounded-full — pills, avatars, dot indicators, circular buttons
//   rounded-2xl  — standard card radius (most cards, list items, panels)
//   rounded-3xl  — hero/emphasis cards (FacilityDetailHeader, ActionPanel,
//                  FacilityCategoryHero, DoctorCard outer gradient)
//   rounded-xl   — inner elements: schedule grid, within-card boxes
//   rounded-lg   — inputs, buttons, modals, compact UI (INTENTIONALLY different
//                  from cards — this is correct, not an inconsistency)
//
// AUDIT — OUTLIERS FOUND (do not fix in this commit):
//   rounded-md — AdminFacilityList activate/deactivate action buttons. These
//                are small inline table actions; rounded-lg is preferred.
//                FIX IN: Phase 1 (admin table polish).
//   rounded-3xl on DoctorCard inner — intentional gradient border trick;
//                leave as-is.

// ─── 4. COMPONENT REFERENCE ──────────────────────────────────────────────────
//
// Pill (src/components/ui/Pill.tsx)
// ──────────────────────────────────
// A compact label element. Renders as <button> when onClick provided, else <span>.
//
//   variant: default | selected | muted | warning | danger | success | info
//   size:    sm (text-xs, px-2 py-0.5) | md (text-xs, px-3 py-1) [default: md]
//   dot:     boolean — renders a size-1.5 rounded-full dot matching variant color
//   icon:    ReactNode — custom leading element (overrides dot)
//   onClick: () => void — if provided, renders as <button>
//
// Badge (src/components/ui/Badge.tsx)
// ────────────────────────────────────
// A slightly more prominent semantic label. Never interactive (no onClick).
// Same variants as Pill minus 'selected'. Used for status labels on cards,
// verification badges, role labels, admin status columns.
//
//   variant: default | muted | warning | danger | success | info
//   size:    sm | md [default: md]
//   dot:     boolean — same colored-dot behavior as Pill
//   icon:    ReactNode — custom leading element
//
// VARIANT → VISUAL MAPPING (both components):
//   default  → bordered, bg-card/bg-muted, text-foreground
//   selected → filled primary, white text (Pill only)
//   muted    → gray border, gray bg, muted-foreground text
//   warning  → amber-50 bg, amber-200 border, amber-700 text
//   danger   → red-50 bg, red-200 border, red-700 text
//   success  → emerald-50 bg, emerald-200 border, emerald-700 text
//   info     → blue-50 bg, blue-200 border, blue-700 text (transitional)

// ─── 5. OUTSTANDING CONVERSIONS ──────────────────────────────────────────────
//
// Files converted in Phase 0 (this commit):
//   ✓ src/components/facility-detail/FacilityDetailHeader.tsx
//   ✓ src/components/specialists/SpecialistCard.tsx
//   ✓ src/components/facility-detail/FacilityDoctorsSection.tsx
//   ✓ src/components/facility-detail/FacilityHoursSection.tsx
//   ✓ src/components/admin/AdminFacilityList.tsx
//   ✓ src/components/admin/AdminClaimsList.tsx
//
// Files to convert in future phases (still using inline pill/badge styles):
//   Phase 1 — public-facing, high-visibility:
//     src/components/trust/VerificationBadge.tsx   (hardcoded hex → Badge)
//     src/components/cards/FacilityCard.tsx        (service tag pills)
//     src/components/cards/DoctorCard.tsx          (specialty tag)
//     src/components/facility-detail/FacilityInformationSection.tsx (tag chips)
//     src/components/facility-detail/FacilityServicesSection.tsx    (service pills)
//     src/components/admin/AdminCorrectionsList.tsx (status badges)
//     src/components/admin/AdminUserList.tsx        (role badges)
//     src/components/admin/AdminSidebar.tsx         (count badge)
//
//   Phase 2 — filter chips (these are interactive and need Pill onClick):
//     src/components/facilities/FacilityCategoryFilters.tsx
//     src/components/diagnostics/DiagnosticsFilterChips.tsx
//     src/components/doctors/SpecialtyFilterChips.tsx
//
//   Phase 2 — provider onboarding:
//     src/components/provider/MilestoneCard.tsx    (status pills)
//     src/components/provider/steps/Step5MediaForm.tsx
//     src/components/provider/steps/Step6ReviewForm.tsx

// Export variant type so consumers can be type-checked
export type PillVariant = "default" | "selected" | "muted" | "warning" | "danger" | "success" | "info";
export type BadgeVariant = "default" | "muted" | "warning" | "danger" | "success" | "info";
export type PillSize = "sm" | "md";
