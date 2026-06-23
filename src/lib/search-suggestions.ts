import type { Facility } from "@/types/facility";

export type SearchSuggestion = {
  id: string;
  name: string;
  metadata: string;
  detailHref?: string;
};

export function getProviderSearchSuggestions(
  facilities: Facility[],
  query: string,
  limit = 6,
): SearchSuggestion[] {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return [];
  }

  // Score each facility by match quality — higher = more relevant
  // Priority tiers:
  //   3 = name starts with query (strongest — "Lancet" → "Lancet General Hospital")
  //   2 = name contains query anywhere
  //   1 = specialty / service / category matches
  //   0 = no match — excluded
  // Location and address are intentionally excluded from autocomplete:
  // area-based filtering belongs in the Filter modal, not here.

  const scored = facilities
    .map((facility) => {
      const normName = normalizeSearchText(facility.name);
      const normCategory = normalizeSearchText(facility.category);
      const normSubcategory = normalizeSearchText(facility.subcategory);
      const normServices = facility.services.map(normalizeSearchText);

      let score = 0;

      if (normName.startsWith(normalizedQuery)) {
        score = 3;
      } else if (normName.includes(normalizedQuery)) {
        score = 2;
      } else if (
        normCategory.includes(normalizedQuery) ||
        normSubcategory.includes(normalizedQuery) ||
        normServices.some((s) => s.includes(normalizedQuery))
      ) {
        score = 1;
      }

      return { facility, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ facility }) => ({
    id: facility.id,
    name: facility.name,
    metadata: [facility.category, facility.location].filter(Boolean).join(" | "),
    detailHref: facility.detailHref ?? `/facilities/${facility.slug}`,
  }));
}

function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}
