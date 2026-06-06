# Codex Task 142: Pharmacies Page Supabase Wiring QA

## Project

DigitalDirectory-v2

## Goal

Verify and, if needed, wire the actual Pharmacies page to use the pharmacy public read helper created in Task 140 and validated in Task 141.

This task follows:

- CodexTask-140-PharmaciesPublicReadHelperImplementation.md
- CodexTask-141-PharmaciesRuntimeProbe.md

The purpose is to confirm that the pharmacy runtime helper is not only working in a standalone probe, but is also safely connected to the visible Pharmacies page experience.

This task should be focused, safe, and limited to page data wiring and QA.

---

## Important Context

Before making changes, read:

- docs/CodexTask-140-PharmaciesPublicReadHelperImplementation.md
- docs/CodexTask-141-PharmaciesRuntimeProbe.md
- src/lib/supabase/pharmacies-public-read.ts
- scripts/probe-pharmacies-public-read.ts
- docs/CodexTask-135-SearchAndCategoryFilteringImplementation.md
- docs/CodexTask-130-PharmacyDiscoverySchema.md
- docs/DevelopmentRoadmap.md
- docs/DataModelContentStructure.md

Also inspect the current Pharmacies page and any pharmacy card/list components.

Likely files to inspect include, but are not limited to:

- src/app/pharmacies/page.tsx
- src/app/search/page.tsx
- src/components
- src/data
- src/lib/public-listing-mappers.ts
- src/types/public-listings.ts

Use the actual project structure if paths differ.

---

## Main Objective

Inspect the visible Pharmacies page and confirm whether it currently uses:

1. Static seed pharmacy data only.
2. The pharmacy Supabase public read helper.
3. A mixed source pattern.

If the page still uses static seed data directly, safely wire it to:

```ts
getSupabasePublicPharmacyCards()