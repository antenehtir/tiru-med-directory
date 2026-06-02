# Codex Task 123: Provider Contact Channels Public Read Helper Implementation

## Goal

Implement a safe Supabase public read helper for provider contact channels.

Do not wire detail pages yet.

## Context

Read:

- docs/ProviderContactChannelsSchemaPlanning.md
- docs/ProviderContactChannelsManualSQLExecutionQARecord.md
- docs/FacilityDetailRouteQARecord.md
- docs/DoctorDetailRouteQARecord.md
- docs/CodexTask-122-ProviderContactChannelsManualSQLExecutionQARecord.md

Inspect:

- src/lib/supabase/public-client.ts
- src/lib/supabase/facilities-public-read.ts
- src/lib/supabase/doctors-public-read.ts
- src/types/public-listings.ts
- supabase/migrations_draft/007_create_provider_contact_channels_table.sql
- supabase/migrations_draft/008_provider_contact_channels_rls_policy.sql
- supabase/migrations_draft/009_provider_contact_channels_test_data.sql

## Implement

Create a helper file such as:

```text
src/lib/supabase/provider-contact-channels-public-read.ts