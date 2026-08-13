-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- Fixes custom "Add other [category] test/service..." entries (Step 3
-- Services, most visibly the Basic Lab / Point-of-care Testing section)
-- rendering in one shared bucket at the bottom of the page instead of
-- inline under the category they were added from.
--
-- Root cause: every custom entry — regardless of which category's input it
-- was typed into — was pushed into the single flat `services` text[] column
-- with no record of its source category. This migration adds a companion
-- jsonb column that tags each custom entry with the category key it came
-- from (e.g. "basiclab-Basic Blood Workup", "general", "pharmacy"), so the
-- UI can group them correctly. `services`/`proposed_services` are unchanged
-- and keep receiving every entry (categorized or not) — existing
-- search/filter code that reads the flat list is unaffected.
--
-- Until this migration is run, the app tolerates the new columns being
-- absent the same way it already does for photo_urls/appointment_modalities
-- — see src/lib/provider/facility-field-mapping.ts and
-- src/app/provider/(console)/onboarding/services/actions.ts. Newly-added
-- custom entries will still land in the flat `services` array either way;
-- only the inline-grouping UI improvement is blocked on this migration.

alter table public.facility_claims
  add column if not exists proposed_custom_service_categories jsonb;

alter table public.facilities
  add column if not exists custom_service_categories jsonb;

NOTIFY pgrst, 'reload schema';
