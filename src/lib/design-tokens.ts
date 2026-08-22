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
// PHASE 9 — "Register" identity pass. Three things changed at this layer:
//
//   1. NEUTRALS ARE WARM. --foreground/--muted-foreground/--border/--background
//      were re-pointed from blue-tinted grays (#1F2937/#6B7280/#E5E7EB/#F7F9FC)
//      to a warm stone family (#1C1917/#57534E/#E7E5E4/#FAF9F7). The SAME token
//      names were re-pointed rather than adding a parallel --ink/--line set, so
//      there is exactly one neutral system and every existing consumer inherits
//      the shift. Dark mode moved to warm stone in the same pass for the same
//      reason. Contrast improved: muted-on-paper went 4.9:1 → 7.25:1.
//
//   2. SURFACE TIERS. --background (paper) → --card → --sunken → --deep.
//      Section rhythm now comes from alternating these instead of the
//      decorative radial dot field, which was removed.
//
//   3. ELEVATION + RADIUS are tokens now, not per-component one-offs:
//      --elevation-card/-lift (warm-tinted, offset + blur) exposed as
//      shadow-card/shadow-lift, and --r-card 14px / --r-control 10px exposed
//      as rounded-card/rounded-control. Pills stay fully round. Declare
//      elevation once — border OR shadow, never a 1px border under a wide
//      soft shadow.
//
// MAPPING — semantic intent → CSS variable → light value → dark value
// ──────────────────────────────────────────────────────────────────────
//
// surfaces    --background  #FAF9F7 (paper)      #1C1917 (warm near-black)
//             --card        #FFFFFF              #292524
//             --sunken      #F4F2EF              #141110
//             --deep        #0B2E2B (both themes — a fixed teal-black)
//   USAGE: --deep is the high-emphasis band (homepage TrustStats) and the
//          footer. It is deliberately NOT theme-dependent: it is a brand
//          surface, not a mode. Derived from --tiru-accent rather than being
//          generic slate, which is what #111827 was through Phase 8.
//
// primary     --primary              #0F766E (teal-700)    #14B8A6 (teal-400)
//   USAGE: CTAs, active states, links, focus rings, Official badge (target),
//          Step progress indicators, onboarding highlight text.
//   RULE (added Phase 7 — public-facing visual system pass): primary is
//          reserved for things a user can click — buttons, active nav state,
//          text links, focus rings. Never used for passive/decorative
//          display (stat numbers, section-header labels, icons that aren't
//          inside a control) — those use --foreground or --muted-foreground
//          instead so color keeps meaning "you can click this."
//   NOTE:  --primary-hover also defined for interactive states.
//
// footer      --footer-background     #111827 (= dark-mode --background)
//             --footer-foreground     #F9FAFB
//             --footer-muted          #9CA3AF
//             --footer-accent         #14B8A6 (= dark-mode --primary)
//             --footer-accent-hover   #2DD4BF
//   USAGE: Footer only (src/components/layout/Footer.tsx) — added Phase 7.
//          Fixed values, NOT redefined under [data-theme="dark"], so the
//          footer is always a dark "grounded zone" regardless of site theme,
//          instead of a primary-tinted wash over the page background. Section
//          headers use --footer-foreground (uppercase caption style, not
//          teal) so they read as labels, not links; --footer-accent is what
//          actual footer links use, keeping "teal = clickable" true even on
//          a dark surface.
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
// success     --success              #10B981 (emerald-500) #34D399 (emerald-400)
//             --success-bg           #ECFDF5 (emerald-50)  rgba(2,44,34,0.4) (emerald-950/40)
//             --success-border       #A7F3D0 (emerald-200) #065F46 (emerald-800)
//             --success-text         #047857 (emerald-700) #34D399 (emerald-400)
//   USAGE: "Available now" indicators, approved status, checkmarks, Active
//          facility status, Open now badge, license "On file" labels.
//   NOTE:  --success is the dot/icon base color. Pill/Badge use --success-bg,
//          --success-border, --success-text for the badge surface.
//
// info        --info                 #3B82F6 (blue-500)    #60A5FA (blue-400)
//             --info-bg              #EFF6FF (blue-50)     #172554 (blue-950)
//             --info-border          #BFDBFE (blue-200)    #1D4ED8 (blue-700)
//             --info-text            #1D4ED8 (blue-700)    #93C5FD (blue-300)
//   USAGE: Non-warning informational chips. Currently: Official badge (blue) —
//          TARGET is to move Official to `primary` (teal) in a later phase.
//          Official = blue is transitional.
//
// muted       --muted / --muted-foreground   #F3F4F6 / #6B7280
//   USAGE: Neutral chips, secondary text, disabled states, "Not uploaded" tags,
//          Closed now badge, unselected filter pills.
//
// category    --category-{key}-bg/-border/-text — added Phase 6
//   USAGE: One accent triad per facility category (hospital/specialty/clinic/
//          diagnostics/pharmacy/ambulance/home-care/default). Originally
//          badge-only; as of Phase 7 this is the SINGLE source for every
//          category-color usage on the public site — badge (Pill, `!`
//          important-modified since Pill's own variant classes have equal
//          Tailwind specificity), the no-photo banner's icon chip
//          (facilityFallbackIconChipClasses — solid -text fill, white icon),
//          the "Browse by category" grid's icon chip
//          (facilityCategoryIconChipClasses — soft -bg fill + -text icon), and
//          the homepage "Quick access" gradient tiles, which run {hue}-700 →
//          {hue}-900 so the light stop IS the token hex (pharmacy #15803D =
//          green-700, ambulance #B45309 = amber-700, specialty #6D28D9 =
//          violet-700, diagnostics #0E7490 = cyan-700).
//          Previously these were four independent, disagreeing hardcoded hue
//          sets (e.g. ambulance showed red in one place, amber in another) —
//          consolidated in Phase 7. All in src/components/cards/
//          facility-category-style.ts.
//   NOTE (Phase 8): the "Browse by category" cards also carried a 2px
//          category-colored top border. It was dropped — a 2px accent dying
//          into a 16px corner radius reads as a rendering artifact, and the
//          icon chip already carries the category signal unambiguously.
//          facilityCategoryBorderTopClasses was removed with its only caller.
//
// no-photo fallback banner (Phase 7): previously a full-card gradient wash in
//          the category's pale tint (facilityBannerGradientClasses, removed)
//          with an always-teal watermark icon that didn't even signal
//          category. A grid of same-category no-photo cards read as
//          duplicates. Now: flat neutral base (facilityBannerFallbackBaseClass
//          = bg-muted) + a small solid icon chip in the category's -text
//          color with a white icon — the chip is what signals category, the
//          base no longer varies per category so repeated cards don't clash.
//
// ─── INCONSISTENCIES TO FIX IN FUTURE PHASES ────────────────────────────────
//
// - Official badge: currently blue (info) in some places, teal (primary) in
//   others (e.g. VerificationBadge vs SpecialistCard). TARGET: all = primary.
//   FIX IN: Phase 1 (trust badges convergence).
//
// - VerificationBadge: FIXED in Phase 3 — now a thin adapter delegating to
//   Badge (variant mapping: community-submitted=warning, facility-owned=info,
//   verified=success, pending=warning), no more hardcoded hex values.
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
// TWO FACES (Phase 9). Inter alone, at one weight range, is what made every
// heading read as a larger size of the body text rather than a different
// voice — the single biggest reason the site looked templated.
//
//   --font-display  Archivo (Google, wght 500/600/700) + Noto Sans Ethiopic
//                   A grotesque with signage / government-form heritage:
//                   sturdy and institutional without being cold. Applied via
//                   the .font-display utility class. Headings and figures only.
//   --font-sans     Inter (unchanged) + Noto Sans Ethiopic
//                   Body, metadata, and dense record text. Genuinely better
//                   than Archivo at 13px in a card.
//
// Noto Sans Ethiopic sits in BOTH stacks so Ge'ez degrades to a designed face
// rather than a system fallback. There is no Amharic in the UI today — this is
// groundwork, and it is far cheaper now than retrofitting later.
//
// SCALE — intentional jumps, not timid increments. Previous scale ran
// 48/24/20/16/14/12 and the 24→20→16 middle was mush.
//
//   Display XL  56px  font-display 700  -0.03em  homepage hero h1
//   Display L   44px  font-display 700  -0.03em  page h1 (listing/detail)
//   Display M   32px  font-display 600  -0.02em  section h2
//   Title       19px  font-display 600  -0.01em  card titles
//   Body        15px  Inter 400                  prose
//   Meta        13px  Inter 400/500              address, hours, distance
//   Micro       11px  Inter 600  +0.08em upper   category labels, eyebrow caps
//
// The 11px micro step is the canonical smallest size. Phase 9 swept the
// text-[10px] one-offs (MobileBottomNavigation, SignInMenu, the search
// autocomplete badges, FacilityLastUpdated) onto it, and retired BrandMark's
// text-[1.45rem]/[1.6rem]/[0.68rem] and the hero's text-[2.15rem].
//
// WEIGHT RULE (Phase 7, still holds): font-bold is for numerals, stat values,
// and display headings. Body headings use font-semibold.
//
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
// AUDIT — OUTLIERS FOUND:
//   rounded-3xl on DoctorCard inner — intentional gradient border trick;
//                leave as-is.

// ─── 4. COMPONENT REFERENCE ──────────────────────────────────────────────────
//
// Pill (src/components/ui/Pill.tsx)
// ──────────────────────────────────
// A compact label element. Renders as <button> when onClick provided, else <span>.
//
//   variant: default | selected | muted | warning | danger | success | info
//   size:    sm (text-xs, px-2 py-0.5) | md (text-xs, px-3 py-1) |
//            lg (text-sm, px-3 py-1.5) [default: md]
//   dot:     boolean — renders a size-1.5 rounded-full dot matching variant color
//   icon:    ReactNode — custom leading element (overrides dot)
//   onClick: () => void — if provided, renders as <button>
//   ariaPressed: boolean — for onClick pills used as toggle/tab controls
//
// Badge (src/components/ui/Badge.tsx)
// ────────────────────────────────────
// A slightly more prominent semantic label. Never interactive (no onClick).
// Same variants as Pill minus 'selected'. Used for status labels on cards,
// verification badges, role labels, admin status columns.
//
//   variant: default | muted | warning | danger | success | info
//   size:    sm | md | lg [default: md]
//   dot:     boolean — same colored-dot behavior as Pill
//   icon:    ReactNode — custom leading element
//   title:   string — native tooltip (used by VerificationBadge)
//
// EmptyState (src/components/ui/EmptyState.tsx) — added Phase 3
// ─────────────────────────────────────────────────────────────
// Centered zero-result state for listing surfaces: muted circular icon,
// title (text-lg font-medium), description (text-sm muted), optional action.
//
//   icon: ReactNode | description: string | action: ReactNode
//
// Also exports SearchIcon / MapPinOffIcon. SearchIcon is a plain magnifier
// used BOTH as the empty-state icon and as the leading adornment inside
// search inputs (ListingSearchBar, SpecialistsPage) — don't add another.
//
// DETAIL-PAGE SECTION HEADER PATTERN (facility + specialist detail pages):
//   <p className="text-xs font-semibold uppercase tracking-wide
//                 text-muted-foreground">{kicker}</p>
//   <h2 className="mt-1 text-xl font-semibold leading-tight
//                  text-foreground">{title}</h2>
// Top-level sections on those pages are separated by gap-8.
// EXCEPTION: the "Similar facilities" / "Similar specialists" sections use a
// deliberately larger related-content treatment (text-sm uppercase primary
// kicker + text-2xl title + description) — consistent with each other.
//
// Skeleton / SkeletonCard / SkeletonCardGrid / SkeletonSpecialistCard(Grid)
// (src/components/ui/Skeleton.tsx) — added Phase 3
// ─────────────────────────────────────────────────────────────
// Skeleton is the base animate-pulse block. SkeletonCard mirrors
// FacilityCard's exact structure (aspect-[16/9] cover photo + name + address
// line + service pill row + single full-width CTA) so loading.tsx routes
// don't shift layout when real content mounts. SkeletonSpecialistCard mirrors
// SpecialistCard's
// different shape (avatar + text, no banner/action row) — do not reuse
// SkeletonCard for specialist grids.
//
// VARIANT → VISUAL MAPPING (both components):
//   default  → bordered, bg-card/bg-muted, text-foreground
//   selected → filled primary, white text (Pill only)
//   muted    → gray border, gray bg, muted-foreground text
//   warning  → amber-50 bg, amber-200 border, amber-700 text (hardcoded, no token triad)
//   danger   → red-50 bg, red-200 border, red-700 text (hardcoded, no token triad)
//   success  → --success-bg / --success-border / --success-text (token-driven)
//   info     → --info-bg / --info-border / --info-text (token-driven)

// ─── 5. OUTSTANDING CONVERSIONS ──────────────────────────────────────────────
//
// Files converted through Phase 3:
//   ✓ src/components/facility-detail/FacilityDetailHeader.tsx
//   ✓ src/components/specialists/SpecialistCard.tsx
//   ✓ src/components/facility-detail/FacilityDoctorsSection.tsx
//   ✓ src/components/facility-detail/FacilityHoursSection.tsx
//   ✓ src/components/admin/AdminFacilityList.tsx
//   ✓ src/components/admin/AdminClaimsList.tsx
//   ✓ src/components/facility-detail/FacilityInformationSection.tsx
//   ✓ src/components/facility-detail/FacilityServicesSection.tsx
//   ✓ src/components/trust/VerificationBadge.tsx  (now delegates to Badge)
//   ✓ src/components/cards/FacilityCard.tsx       (service pills, +N more overflow;
//       Phase 6 — result-card redesign: category badge now uses the
//       --category-* token set below instead of a plain white pill)
//   ✓ src/components/nearby/NearbyPage.tsx        (toggle/category/specialty pills)
//   ✓ src/components/specialists/SpecialistDetailPage.tsx  (Phase 4 — role/
//       appointment/Official badges, language pills, kicker+title headers)
//   ✓ src/components/specialists/SpecialistAvailabilitySection.tsx (Phase 4 —
//       hardcoded emerald status chip → Badge dot success/muted)
//   ✓ src/components/specialists/SpecialistsPage.tsx (Phase 4 — specialty pills)
//   ✓ src/components/specialists/SpecialistCard.tsx  (Phase 4 — +N more overflow)
//   ✓ src/components/ui/AvailabilityIndicator.tsx    (Phase 4 — emerald-* →
//       bg-success / text-success-text tokens)
//   ✓ src/components/provider/ProviderConsoleShell.tsx (Phase 5 — StatusBadge
//       → Badge success/warning/danger/muted; teal-* → primary token)
//   ✓ src/components/provider/steps/Step1IdentityForm.tsx (Phase 5 — branches/
//       languages/patient-groups native checkbox groups → PillOption)
//   ✓ src/components/provider/steps/Step3ServicesForm.tsx (Phase 5 — all
//       onClick pill helpers → literal Pill; removable tag chips →
//       getPillClassName("selected"))
//   ✓ src/components/provider/steps/Step4DoctorsForm.tsx (Phase 5 — languages/
//       appointment-required → Pill)
//   ✓ src/components/provider/steps/Step5MediaForm.tsx (Phase 5 — hardcoded
//       hex "Document on file" chips → Badge success; RequiredForApproval →
//       Badge warning)
//   ✓ src/components/provider/steps/Step6ReviewForm.tsx (Phase 5 — local Pill/
//       Chip → Badge; ringColorClass/status text → primary/warning/
//       success-text tokens)
//   ✓ src/components/provider/SettingsForm.tsx (Phase 5 — error/success
//       messaging → danger/success token banners)
//
// New shared provider-portal components (Phase 5):
//   src/components/provider/Spinner.tsx    — border-spin loader, tone=
//     "primary" (default, for light backgrounds) | "on-primary" (for spinners
//     rendered on solid bg-primary buttons — default tone is illegible there)
//   src/components/provider/SubmitButton.tsx — useFormStatus-based submit
//     button for <form action={serverAction}> flows; must be a form
//     descendant. Steps 4/5/6 and settings don't use <form action>, so they
//     build the equivalent loading button manually from their own
//     useTransition() isPending — see those files for the pattern.
//   src/components/provider/AutoSaveIndicator.tsx — single "Saving…" /
//     "Draft saved {time}" indicator replacing each step's own copy
//   src/components/provider/PillOption.tsx — Pill-styled wrapper around a
//     REAL native <input type="checkbox"/"radio">, for onboarding fields that
//     submit via native FormData (name=/value= read server-side). Visually
//     identical to Pill (shares getPillClassName) but keeps native form
//     semantics — do NOT use plain <Pill onClick> where a field's value is
//     read via formData.get()/getAll() rather than mirrored to a hidden input.
//
// Phase 7 — public-facing visual system pass (color-role + fallback-banner
// consolidation across homepage, nav, footer, facility cards, facility
// detail, Nearby, Specialists):
//   ✓ src/components/layout/Footer.tsx — new fixed-dark "Slate Ground"
//       surface (--footer-*) replacing the primary-tinted wash; section
//       headers off teal onto footer-foreground, links keep teal (still the
//       clickable-things color, just its dark-surface value).
//   ✓ src/components/home/TrustStatsSection.tsx — stat icon/value off
//       text-primary onto text-muted-foreground / text-foreground (passive
//       display, not a click target, shouldn't borrow the interactive color).
//   ✓ src/components/cards/facility-category-style.ts — replaced
//       facilityBannerGradientClasses (per-category wash) with
//       facilityBannerFallbackBaseClass (flat neutral) +
//       facilityFallbackIconChipClasses (solid icon chip); added
//       facilityCategoryIconChipClasses to give QuickCategoriesSection a
//       token-driven treatment instead of its own hardcoded hues.
//   ✓ src/components/cards/FacilityCard.tsx,
//     src/components/facility-detail/FacilityDetailHeader.tsx — no-photo
//       banner now neutral base + small solid category icon chip instead of
//       a full-card category-tinted gradient with an always-teal watermark.
//   ✓ src/components/home/QuickCategoriesSection.tsx — icon chip + top-border
//       accent now come from the shared category tokens (was bg-soft-accent
//       text-primary for every category, plus a fifth independent hue set for
//       the border). "Specialists" (not a real category) gets a neutral
//       treatment instead of a color.
//   ✓ src/components/home/CategoryShowcaseSection.tsx — gradient tiles
//       recolored to match the canonical category hue family (ambulance was
//       red, now amber; diagnostics was blue, now cyan — both now agree with
//       the badge/banner/grid); "Find a Specialist" tile off teal onto
//       neutral slate; tile title font-bold → font-semibold.
//   ✓ src/components/home/PromoBanner.tsx — hardcoded bg-teal-50 → bg-muted
//       for the no-image fallback variant.
//
// Files to convert in future phases (still using inline pill/badge styles):
//   Phase 6 — public-facing:
//     src/components/cards/DoctorCard.tsx          (specialty tag)
//     src/components/admin/AdminCorrectionsList.tsx (status badges)
//     src/components/admin/AdminUserList.tsx        (role badges)
//     src/components/admin/AdminSidebar.tsx         (count badge)
//
//   Phase 6 — filter chips (these are interactive and need Pill onClick):
//     src/components/facilities/FacilityCategoryFilters.tsx
//     src/components/diagnostics/DiagnosticsFilterChips.tsx
//     src/components/doctors/SpecialtyFilterChips.tsx
//
//   Phase 6 — provider onboarding:
//     src/components/provider/MilestoneCard.tsx    (status pills)

// Export variant type so consumers can be type-checked
export type PillVariant = "default" | "selected" | "muted" | "warning" | "danger" | "success" | "info";
export type BadgeVariant = "default" | "muted" | "warning" | "danger" | "success" | "info";
// "lg" added in Phase 3 to absorb VerificationBadge's larger banner-badge size
// (was a one-off "sm"|"lg" prop on that component) into the shared scale.
export type PillSize = "sm" | "md" | "lg";
