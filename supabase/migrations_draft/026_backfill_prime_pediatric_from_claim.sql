-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- Run AFTER migration 025 (which adds the columns).
--
-- One-time backfill: copies proposed_* fields from Prime Pediatric Clinic's approved
-- claim into the facilities row. The original approval ran before migration 025 added
-- these columns, so buildFacilityFieldsFromClaim() skipped them at that time.
--
-- Also safe to run on any other approved new-listing facility that was approved before
-- migration 025 — just change the slug and provider name accordingly.

UPDATE facilities f
SET
  doctors           = c.proposed_doctors,
  emergency_type    = c.proposed_emergency_type,
  walkin_appointment = c.proposed_walkin_appointment,
  schedule          = c.proposed_schedule
FROM facility_claims c
JOIN provider_accounts pa ON pa.id = c.provider_id
WHERE f.slug = 'prime-pediatric-clinic'
  AND pa.facility_name ILIKE '%Prime Pediatric%'
  AND c.status = 'approved';

NOTIFY pgrst, 'reload schema';
