import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";
import type { Facility } from "@/types/facility";

export type FacilityCardCategoryKey =
  | "hospital"
  | "specialty"
  | "diagnostics"
  | "pharmacy"
  | "default";

export function resolveFacilityCardCategoryKey(
  facility: Facility,
): FacilityCardCategoryKey {
  const searchableText = [facility.category, facility.subcategory, facility.name]
    .join(" ")
    .toLowerCase();

  if (searchableText.includes("hospital")) {
    return "hospital";
  }

  if (searchableText.includes("specialty")) {
    return "specialty";
  }

  if (searchableText.includes("pharmacy")) {
    return "pharmacy";
  }

  if (
    searchableText.includes("diagnostic") ||
    searchableText.includes("laboratory") ||
    searchableText.includes("imaging") ||
    searchableText.includes("radiology")
  ) {
    return "diagnostics";
  }

  return "default";
}

export const facilityBannerGradientClasses: Record<
  FacilityCardCategoryKey,
  string
> = {
  hospital: "bg-gradient-to-br from-blue-50 to-blue-100",
  specialty: "bg-gradient-to-br from-violet-50 to-violet-100",
  diagnostics: "bg-gradient-to-br from-cyan-50 to-cyan-100",
  pharmacy: "bg-gradient-to-br from-green-50 to-green-100",
  default: "bg-gradient-to-br from-teal-50 to-teal-100",
};

export const facilityBorderGradientClasses: Record<
  FacilityCardCategoryKey,
  string
> = {
  hospital:
    "from-blue-300/60 to-blue-100/20 hover:from-blue-400/80 hover:to-blue-200/30",
  specialty:
    "from-violet-300/60 to-violet-100/20 hover:from-violet-400/80 hover:to-violet-200/30",
  diagnostics:
    "from-cyan-300/60 to-cyan-100/20 hover:from-cyan-400/80 hover:to-cyan-200/30",
  pharmacy:
    "from-green-300/60 to-green-100/20 hover:from-green-400/80 hover:to-green-200/30",
  default: "from-primary/30 to-primary/10 hover:from-primary/50 hover:to-primary/20",
};

export const facilityWatermarkIconKey: Record<
  FacilityCardCategoryKey,
  FacilityCategoryFilter
> = {
  hospital: "hospital",
  specialty: "specialty",
  diagnostics: "diagnostics",
  pharmacy: "pharmacy",
  default: "clinic",
};
