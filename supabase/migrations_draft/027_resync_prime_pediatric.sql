-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- CONTEXT: Prime Pediatric Clinic's July 2 live-edit session (WhatsApp, Telegram,
-- email, insurance, and an added "Medical certificate" service) was written
-- correctly to facility_claims.proposed_* but never reached the public
-- facilities row. Root cause: facilities had RLS enabled with no UPDATE policy
-- covering the provider role, so every autoSaveStepN live-sync write silently
-- affected 0 rows (no RLS violation error — PostgREST just filters the row out).
-- See 028_facilities_provider_update_policy.sql for the actual fix; this
-- migration only catches up the one row that was already stuck.
--
-- Verified via direct read against the live claim/facility rows before writing
-- this file:
--   facility_claims (id 90549a2e...): status='approved', facility_id set,
--     proposed_telegram='@tkaleab', proposed_whatsapp='+251911242557',
--     proposed_email='tkaleab@yahoo.com', proposed_services includes
--     "Medical certificate", proposed_insurance_accepted=true,
--     proposed_insurance_note='Cigna', proposed_payment_methods includes
--     "Insurance". updated_at = 2026-07-02T11:38:50Z.
--   facilities (id b42a5a89...): telegram=null, whatsapp=null, email=null,
--     services missing "Medical certificate", insurance_accepted=false,
--     insurance_note=null. updated_at = 2026-06-30T13:53:27Z (stale — predates
--     the July 2 edit entirely).

UPDATE facilities f
SET
  telegram = fc.proposed_telegram,
  whatsapp = fc.proposed_whatsapp,
  email = fc.proposed_email,
  services = fc.proposed_services,
  insurance_accepted = fc.proposed_insurance_accepted,
  insurance_note = fc.proposed_insurance_note,
  payment_methods = fc.proposed_payment_methods,
  updated_at = now()
FROM facility_claims fc
WHERE f.slug = 'prime-pediatric-clinic'
  AND fc.facility_id = f.id
  AND fc.status = 'approved';

NOTIFY pgrst, 'reload schema';
