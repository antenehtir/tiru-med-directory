-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- CONTEXT: the provider removed "Nutrition and Dietetics" from Prime
-- Pediatric's services today. The audit log (shipped in the previous
-- migration, 059) caught the write failing outright: facility_claims.
-- proposed_name has never been set for this claim (the provider never
-- revisited the identity step after going live), so
-- syncToFacilityIfApproved sent name: null into the UPDATE, and
-- facilities.name is NOT NULL — the whole write was rejected, so the
-- services removal never reached the public page either, even though it
-- had nothing to do with the name field.
--
-- The application code is fixed (syncToFacilityIfApproved now excludes name
-- unconditionally and runs the payload through filterNonEmpty, matching
-- what the admin approval path already did). This migration only catches
-- up the one row that got stuck by the bug before the fix shipped.
--
-- Verified via direct read against the live claim/facility rows before
-- writing this file: facility_claims (id 90549a2e...) proposed_services
-- does not include "Nutrition and Dietetics"; facilities (id b42a5a89...)
-- services still does. claim.updated_at (2026-09-15T11:40:13Z) is newer
-- than facility.updated_at (2026-09-15T10:56:45Z) — the failed write never
-- touched the live row.

UPDATE facilities f
SET
  services = fc.proposed_services,
  updated_at = now()
FROM facility_claims fc
WHERE f.slug = 'prime-pediatric-clinic'
  AND fc.facility_id = f.id
  AND fc.status = 'approved';

NOTIFY pgrst, 'reload schema';
