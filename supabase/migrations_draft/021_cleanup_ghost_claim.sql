-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- Removes the ghost duplicate claim created by the now-fixed getOrCreateClaim() bug
-- for provider Dr Kale-Ab Tesfaye / Prime Pediatric Clinic.
-- CONFIRM the IDs below match your live data before running (use the SELECT below first).

-- Step 1: Verify current state (run this first, read-only)
-- SELECT id, status, submission_step, completion_pct, submitted_at, created_at
-- FROM facility_claims
-- WHERE provider_id = 'c24e92da-4c4f-4002-a979-9e6c351588a7'
-- ORDER BY created_at DESC;

-- Step 2: Delete the ghost claim (only if Step 1 confirms this is the empty pending row)
DELETE FROM facility_claims
WHERE id = '57a15bb4-efa7-4e6f-a5dc-6bb971e0d317'
  AND status = 'pending'
  AND completion_pct = 0;

-- Step 3: Verify only the real submitted claim remains
-- SELECT id, status, submission_step, submitted_at
-- FROM facility_claims
-- WHERE provider_id = 'c24e92da-4c4f-4002-a979-9e6c351588a7';

-- ─────────────────────────────────────────────────────────────────────────────
-- PART C — Check for other providers affected by the same ghost-claim bug
-- Run this separately to find any provider with more than one claim row:
-- SELECT provider_id, COUNT(*) AS claim_count,
--        array_agg(status ORDER BY created_at) AS statuses,
--        array_agg(created_at ORDER BY created_at) AS created_dates
-- FROM facility_claims
-- GROUP BY provider_id
-- HAVING COUNT(*) > 1;
-- ─────────────────────────────────────────────────────────────────────────────
