# Codex Task 131A: Public Card Detail Link Alignment

## Goal

Ensure public facility and doctor cards link to their dynamic Supabase-backed detail routes.

This fixes the issue where direct dynamic routes work, but some card “View details” buttons may still point to old/static preview behavior.

## Context

Read:

- docs/FacilityDetailRouteQARecord.md
- docs/DoctorDetailRouteQARecord.md
- docs/FacilityContactChannelsWiringQARecord.md
- docs/DoctorContactChannelsWiringQARecord.md
- docs/ProviderContactChannelsRuntimeQARecord.md

Inspect:

- src/app/facilities/page.tsx
- src/components/facilities/FacilitiesPage.tsx
- src/app/doctors/page.tsx
- src/components/doctors/DoctorsPage.tsx
- src/lib/supabase/facilities-public-read.ts
- src/lib/supabase/doctors-public-read.ts
- src/types/public-listings.ts

## Problem

The Supabase-backed dynamic routes work:

- /facilities/test-facility-alpha
- /facilities/test-facility-eta-minimal
- /facilities/test-facility-zeta-disputed
- /doctors/test-doctor-alpha
- /doctors/test-doctor-eta-minimal
- /doctors/test-doctor-zeta-disputed

Contact channels also work on those dynamic routes.

But some card buttons on list pages may not consistently link to these dynamic slug routes.

## Implement

Align card “View details” navigation:

Facility cards should link to:

```text
/facilities/[slug]