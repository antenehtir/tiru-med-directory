import {
  FACILITY_CATEGORY_DB_MAP,
  type FacilityCategoryFilter,
} from "@/lib/frontend-search-filters";
import type { Facility } from "@/types/facility";

// Card-facing category key — the real 7-category taxonomy (FacilityCategoryFilter)
// plus "default" for any facility.category value that isn't in the map yet.
export type FacilityCardCategoryKey = FacilityCategoryFilter | "default";

// Reverse lookup built from the single source of truth (FACILITY_CATEGORY_DB_MAP)
// instead of a second, divergent text-matching heuristic — the old version of
// this function fuzzy-matched name/category/subcategory substrings and silently
// dropped clinic/ambulance/home-care into "default", out of step with how
// /facilities and the filter modal already categorize the same data.
const DB_CATEGORY_TO_KEY: Record<string, FacilityCategoryFilter> = Object.fromEntries(
  Object.entries(FACILITY_CATEGORY_DB_MAP).flatMap(([key, dbNames]) =>
    dbNames.map((dbName) => [dbName, key as FacilityCategoryFilter]),
  ),
);

export function resolveFacilityCardCategoryKey(
  facility: Facility,
): FacilityCardCategoryKey {
  return DB_CATEGORY_TO_KEY[facility.category] ?? "default";
}

export const facilityBannerGradientClasses: Record<
  FacilityCardCategoryKey,
  string
> = {
  hospital:    "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
  specialty:   "bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900",
  clinic:      "bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900",
  diagnostics: "bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900",
  pharmacy:    "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
  ambulance:   "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900",
  "home-care": "bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900",
  default:     "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800",
};

export const facilityBorderGradientClasses: Record<
  FacilityCardCategoryKey,
  string
> = {
  hospital:
    "from-blue-300/60 to-blue-100/20 hover:from-blue-400/80 hover:to-blue-200/30",
  specialty:
    "from-violet-300/60 to-violet-100/20 hover:from-violet-400/80 hover:to-violet-200/30",
  clinic:
    "from-teal-300/60 to-teal-100/20 hover:from-teal-400/80 hover:to-teal-200/30",
  diagnostics:
    "from-cyan-300/60 to-cyan-100/20 hover:from-cyan-400/80 hover:to-cyan-200/30",
  pharmacy:
    "from-green-300/60 to-green-100/20 hover:from-green-400/80 hover:to-green-200/30",
  ambulance:
    "from-amber-300/60 to-amber-100/20 hover:from-amber-400/80 hover:to-amber-200/30",
  "home-care":
    "from-pink-300/60 to-pink-100/20 hover:from-pink-400/80 hover:to-pink-200/30",
  default: "from-primary/30 to-primary/10 hover:from-primary/50 hover:to-primary/20",
};

export const facilityWatermarkIconKey: Record<
  FacilityCardCategoryKey,
  FacilityCategoryFilter
> = {
  hospital: "hospital",
  specialty: "specialty",
  clinic: "clinic",
  diagnostics: "diagnostics",
  pharmacy: "pharmacy",
  ambulance: "ambulance",
  "home-care": "home-care",
  default: "clinic",
};

// Category badge (bottom-left overlay on the card's cover photo) — driven by
// the --category-* design tokens in globals.css, not one-off hex values.
// Important-modifiers are required here: Pill's own `variant="default"`
// classes (border-border/bg-card/text-foreground) have equal specificity, so
// an un-flagged override would be at the mercy of Tailwind's generated
// stylesheet order instead of the className prop's intent.
export const facilityCategoryBadgeClasses: Record<FacilityCardCategoryKey, string> = {
  hospital:
    "!border-category-hospital-border !bg-category-hospital-bg !text-category-hospital-text",
  specialty:
    "!border-category-specialty-border !bg-category-specialty-bg !text-category-specialty-text",
  clinic:
    "!border-category-clinic-border !bg-category-clinic-bg !text-category-clinic-text",
  diagnostics:
    "!border-category-diagnostics-border !bg-category-diagnostics-bg !text-category-diagnostics-text",
  pharmacy:
    "!border-category-pharmacy-border !bg-category-pharmacy-bg !text-category-pharmacy-text",
  ambulance:
    "!border-category-ambulance-border !bg-category-ambulance-bg !text-category-ambulance-text",
  "home-care":
    "!border-category-home-care-border !bg-category-home-care-bg !text-category-home-care-text",
  default:
    "!border-category-default-border !bg-category-default-bg !text-category-default-text",
};

// Short display label for the category badge. Mirrors the real taxonomy used
// by /facilities and the filter modal (FacilityCategoryFilter) rather than a
// generic label set — this app doesn't split "Lab" from "Imaging", both are
// the single "diagnostics" category.
export const facilityCategoryBadgeLabels: Record<FacilityCardCategoryKey, string> = {
  hospital: "Hospital",
  specialty: "Specialty Center",
  clinic: "Clinic",
  diagnostics: "Diagnostics",
  pharmacy: "Pharmacy",
  ambulance: "Ambulance",
  "home-care": "Home Care",
  default: "Other",
};
