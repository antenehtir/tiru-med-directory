-- ACTION REQUIRED — run against live Supabase project (SQL editor).
--
-- Adds proposed_branches (JSONB array) to facility_claims to support the
-- multi-branch repeater in Step 2 (Location). Each element holds a single
-- branch's name/area/landmark/lat/lng/maps_link, entered when
-- proposed_branch_count > 1. Confirmed via PostgREST schema introspection
-- that this column does not yet exist on the live table.

ALTER TABLE public.facility_claims
  ADD COLUMN IF NOT EXISTS proposed_branches jsonb DEFAULT '[]'::jsonb;
