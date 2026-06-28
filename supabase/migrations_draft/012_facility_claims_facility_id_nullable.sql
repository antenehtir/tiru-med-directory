-- ACTION REQUIRED — run against live Supabase project (SQL editor).
--
-- facility_claims.facility_id is currently NOT NULL with no default.
-- This breaks the "list a new facility" provider flow: when a provider
-- has no claimed facility yet, getOrCreateClaim() inserts
-- facility_id: null, which violates this constraint (error 23502) and
-- is silently swallowed, surfacing as "Could not load your draft" on
-- /provider/onboarding/identity. A null facility_id is the intended
-- way to represent a brand-new (not-yet-existing) facility listing.

ALTER TABLE public.facility_claims
  ALTER COLUMN facility_id DROP NOT NULL;
