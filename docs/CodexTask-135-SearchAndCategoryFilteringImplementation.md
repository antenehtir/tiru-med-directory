# Codex Task 135: Search and Category Filtering Implementation

## Goal

Continue from Task 134 by making routed search and category pages actually filter displayed results.

Task 134 already wired homepage search/category actions to routes like:

- /search
- /search?q=...
- /doctors
- /pharmacies
- /facilities?category=hospital
- /facilities?category=clinic
- /facilities?category=laboratory

Task 135 should implement simple frontend filtering using existing mock/sample data.

## Important Context

Read first:

- docs/CodexTask-133-HomeHeroSearchAndCategoryRoutingPlan.md
- docs/CodexTask-134-HomeHeroSearchAndCategoryRoutingImplementation.md
- docs/DataModelContentStructure.md
- docs/DevelopmentRoadmap.md
- docs/DesignSystem.md

Also inspect:

- src/app/search/page.tsx
- src/app/facilities/page.tsx
- src/app/doctors/page.tsx
- src/app/pharmacies/page.tsx
- src/components
- src/data

## Main Objective

Implement frontend-only filtering for:

1. Search query filtering
2. Facility category filtering
3. Doctor search/filter display
4. Pharmacy page display if data exists
5. Helpful empty states

No backend. No Supabase changes. No SQL. No real search engine.

## Requirements

### Search Page

For `/search?q=cardiology`:

- Read the query parameter.
- Filter available mock/sample data by name, category, specialty, service, location, and keywords.
- Show matching doctors/facilities/pharmacies if available.
- If no query is provided, show general searchable previews.
- If no results match, show a friendly empty state.

### Facilities Page

For:

```text
/facilities?category=hospital
/facilities?category=clinic
/facilities?category=laboratory