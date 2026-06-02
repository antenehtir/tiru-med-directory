# Codex Task 128: Wire Contact Channels Into Doctor Detail Page

## Goal

Wire safe public provider contact channels into doctor detail pages.

## Context

Read:

- docs/ProviderContactChannelsRuntimeQARecord.md
- docs/DoctorDetailRouteQARecord.md
- docs/DoctorsPageSupabaseWiringQARecord.md
- docs/FacilityContactChannelsWiringQARecord.md
- docs/CodexTask-127-FacilityContactChannelsWiringQARecord.md

Inspect:

- src/app/doctors/[slug]/page.tsx
- src/lib/supabase/doctors-public-read.ts
- src/lib/supabase/provider-contact-channels-public-read.ts
- src/app/facilities/[slug]/page.tsx
- src/components/facility-detail/FacilityActionPanel.tsx
- src/types/public-listings.ts

## Implement

On doctor detail pages, fetch public contact channels using:

```ts
getSupabasePublicProviderContactChannels("doctor", slug)