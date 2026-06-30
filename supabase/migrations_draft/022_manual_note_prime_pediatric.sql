-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- ─────────────────────────────────────────────────────────────────────────────
-- CONTEXT: Prime Pediatric Clinic was approved via /admin/claims before the
-- new-listing approval path was built. The broken path updated
-- provider_accounts (verification_status_internal → 'verified') but never
-- touched facility_claims or created a facilities row.
--
-- CURRENT STATE (verify with the SELECT below before running anything):
--   provider_accounts.verification_status_internal = 'verified'   ← already done
--   provider_accounts.status                        = 'approved'   ← already done
--   provider_accounts.facility_id                   = NULL         ← not linked
--   facility_claims.status                          = 'pending_review' ← stuck
--   facilities row for Prime Pediatric Clinic       = does not exist
--
-- FIX: This cannot be done cleanly in raw SQL because it requires reading
-- the proposed_* JSON data from facility_claims and inserting a mapped
-- facilities row. The correct fix is to re-run the approval through the
-- now-fixed UI.
--
-- STEP 1: Confirm current state (read-only)
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT id, status, verification_status_internal, onboarding_phase,
--        facility_id, facility_name, reviewed_by, reviewed_at
-- FROM provider_accounts
-- WHERE facility_name ILIKE '%Prime Pediatric%';

-- SELECT id, status, submission_step, completion_pct, submitted_at, facility_id
-- FROM facility_claims
-- WHERE provider_id = '<id from above>'
-- ORDER BY created_at DESC;

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: Reset provider_accounts so the claim reappears in /admin/claims
-- ─────────────────────────────────────────────────────────────────────────────
-- The Claim Verification page filters on verification_status_internal
-- IN ('call_pending', 'unverified'). After the broken approval, this was
-- flipped to 'verified', so the claim disappeared from the queue.
-- Reset it to 'unverified' so it reappears:

UPDATE provider_accounts
SET
  verification_status_internal = 'unverified',
  status = 'pending',
  onboarding_phase = 7,
  reviewed_by = NULL,
  reviewed_at = NULL
WHERE facility_name ILIKE '%Prime Pediatric%'
  AND verification_status_internal = 'verified';

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: After running Step 2, go to /admin/claims and re-approve normally.
-- The fixed approveClaim() will:
--   1. Create a new facilities row from the claim's proposed_* data
--   2. Set provider_accounts.facility_id to the new row
--   3. Flip facility_claims.status → 'approved'
--   4. Write an audit_log entry
-- ─────────────────────────────────────────────────────────────────────────────

NOTIFY pgrst, 'reload schema';
