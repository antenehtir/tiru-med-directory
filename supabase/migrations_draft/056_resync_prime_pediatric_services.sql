-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- CONTEXT: Prime Pediatric Clinic's provider removed several services
-- (Medical certificate, Pharmacy service, ionised calcium, serum insulin,
-- X-Ray, Ultrasound, child speech therapy) via the provider onboarding
-- services step today (2026-09-15). The edit was written correctly to
-- facility_claims.proposed_services / proposed_custom_service_categories,
-- but never reached the public facilities row, because facilities has RLS
-- enabled with no UPDATE policy covering the provider role — the exact bug
-- 027_resync_prime_pediatric.sql and 028_facilities_provider_update_policy.sql
-- already diagnosed for a July 2 edit. 028 was never actually run, so the
-- same drift has recurred. Run 028 alongside this file so future provider
-- edits sync live on their own; this migration only catches up the one row
-- that is already stuck.
--
-- Scoped to `services` and `custom_service_categories` only — the two fields
-- the provider's edit actually changed with intent. A broader audit
-- (probe-live-sync-drift.ts, run against live data before writing this file)
-- also found `doctors` and `checkup_offered` differing between the claim and
-- the live row, but those diffs look like a separate, unrelated anomaly (the
-- claim's doctor entry has lost its specialty/subspecialty, which would make
-- the public page worse if copied over) — deliberately left untouched here,
-- flagged to the user instead of auto-resolved.
--
-- Verified via direct read against the live claim/facility rows before
-- writing this file:
--   facility_claims (id 90549a2e...): status='approved', facility_id set,
--     proposed_services missing "Medical certificate", "Pharmacy service",
--     "ionised calcium", "serum  insulin", "X-Ray", "Ultrasound",
--     "child speech therapy" (all still present on the live row).
--     proposed_custom_service_categories.general = [] (live row still has
--     "virtual clinic" and "Medical certificate" tagged there).
--     updated_at = 2026-09-15T10:22:55Z.
--   facilities (id b42a5a89...): updated_at = 2026-09-14T07:46:30Z — stale,
--     predates today's edit entirely.

UPDATE facilities f
SET
  services = fc.proposed_services,
  custom_service_categories = fc.proposed_custom_service_categories,
  updated_at = now()
FROM facility_claims fc
WHERE f.slug = 'prime-pediatric-clinic'
  AND fc.facility_id = f.id
  AND fc.status = 'approved';

NOTIFY pgrst, 'reload schema';
