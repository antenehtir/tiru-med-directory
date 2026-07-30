-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- ─────────────────────────────────────────────────────────────────────────────
-- CONTEXT: "Antex int med care" (submitter Dr. Anteneh Mekuria) was prematurely
-- shown to admin in Provider Submissions and clicked "Approve & publish
-- listing" — before the provider had submitted anything (still 0% complete,
-- draft only). approveClaim() unconditionally flips provider_accounts to
-- verified/approved BEFORE checking whether a submitted claim exists, so the
-- premature click partially succeeded (provider_accounts corrupted) even
-- though it then correctly refused to create a facility.
--
-- CONFIRMED STATE (read-only queries, run 2026-07-30):
--   provider_accounts.status                        = 'approved'        ← wrong, no facility exists
--   provider_accounts.verification_status_internal   = 'verified'        ← wrong
--   provider_accounts.onboarding_phase                = 8                ← wrong
--   provider_accounts.reviewed_by / reviewed_at       = set               ← wrong (no real review happened)
--   provider_accounts.facility_id                     = NULL              (correct — nothing created)
--   facility_claims.status                            = 'pending'         (correct — still a draft, never submitted)
--   facility_claims.completion_pct                    = 0                 (correct — nothing filled in yet)
--   facility_claims.submitted_at                       = NULL              (correct — never submitted)
--   facilities row for "Antex int med care"           = does not exist   (correct — nothing to create yet)
--
-- IMPORTANT: facility_claims is untouched and already correct — do NOT modify
-- it. The provider's own dashboard reads facility_claims.status (not
-- provider_accounts.status) to decide what to show, so this provider was
-- NOT seeing a false "approved" screen; the corruption is confined to
-- provider_accounts fields, which record a review that never really
-- completed. After the code fix (Provider Submissions now filters on
-- facility_claims.status = 'pending_review'), this draft will correctly stop
-- appearing in admin until the provider actually submits — no data change is
-- required for that part. This migration only cleans up the incorrect
-- provider_accounts audit-trail fields so a future real admin action isn't
-- confused by stale reviewed_by/reviewed_at values.
--
-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: Confirm current state (read-only) — run this first
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT id, email, display_name, facility_name, facility_id, status,
--        verification_status_internal, onboarding_phase, completion_pct,
--        reviewed_by, reviewed_at, created_at
-- FROM provider_accounts
-- WHERE facility_name ILIKE '%Antex%';

-- SELECT id, status, facility_id, completion_pct, submission_step,
--        submitted_at, proposed_name, created_at, updated_at
-- FROM facility_claims
-- WHERE provider_id = (SELECT id FROM provider_accounts WHERE facility_name ILIKE '%Antex%');

-- SELECT id, name, slug FROM facilities WHERE name ILIKE '%Antex%';
-- (expect zero rows — confirms no facility was actually created)

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: Reset provider_accounts to an un-reviewed state
-- ─────────────────────────────────────────────────────────────────────────────
-- Only run this if the STEP 1 SELECTs above confirm the state described
-- above (facility_id NULL, no facilities row, facility_claims still
-- 'pending'/0%). Do NOT run if a facilities row now exists — that would mean
-- the situation has already changed since this file was written.

UPDATE provider_accounts
SET
  status = 'incomplete',
  verification_status_internal = 'unverified',
  onboarding_phase = 1,
  reviewed_by = NULL,
  reviewed_at = NULL
WHERE facility_name ILIKE '%Antex int med care%'
  AND facility_id IS NULL
  AND status = 'approved';

-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 3: Nothing further needed.
-- ─────────────────────────────────────────────────────────────────────────────
-- The provider's facility_claims row is already correctly 'pending' at 0% —
-- they simply continue onboarding normally from where they left off. Once
-- they complete Steps 1-6 and click Submit (reaching 70%+ with both
-- licenses), the claim flips to 'pending_review' and will correctly appear
-- in Provider Submissions → New Listings for a normal, single approval.

NOTIFY pgrst, 'reload schema';
