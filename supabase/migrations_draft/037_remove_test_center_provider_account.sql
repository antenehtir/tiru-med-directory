-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — NOT YET APPLIED.
--
-- Follow-up to 036. That migration deleted the "Test center" facility listing
-- and detached its dependants; it deliberately stopped short of removing the
-- account behind it, because deleting an auth user is a bigger decision than
-- deleting a listing. That decision has now been made: the provider account
-- vision2377@gmail.com and its auth user are confirmed test artifacts and are
-- removed here.
--
-- ── Convention note ────────────────────────────────────────────────────────
-- Earlier files in this folder kept their statements commented out. That
-- caused repeated false "no rows returned" readings, because a commented
-- SELECT returns nothing and looks identical to a SELECT that genuinely found
-- nothing. Everything below is live SQL. STEP 1 is read-only and safe to run
-- on its own; STEP 2 is the destructive part and is a separate transaction, so
-- you can run STEP 1, read the output, and only then run STEP 2.
--
-- ── What gets removed, and in what order ───────────────────────────────────
--   1. storage objects under provider-documents/<claim id>/ — license scans.
--      Uploaded as `${claimId}/license.${ext}` (Step5MediaForm.tsx), so the
--      folder is the claim id and must be resolved BEFORE the claim is
--      deleted. Hence storage goes first.
--   2. facility_claims rows for this provider. Its ON DELETE behaviour is not
--      defined anywhere in this repo, so the rows are deleted explicitly
--      rather than relying on a cascade that may not exist.
--   3. provider_accounts row. Strictly redundant — its PK is
--      `references auth.users (id) on delete cascade` (migration 011) — but
--      done explicitly so the intent is visible and step 4 cannot silently
--      leave it behind if that FK ever changes.
--   4. the auth.users row.
--
-- NOT removed, on purpose:
--   audit_log entries. Polymorphic (entity_type + entity_id, no FK) and
--   entity_id is TEXT — see the note in 036. An audit trail should outlive
--   what it describes; deleting history to tidy up a test record would be
--   the wrong instinct, and these rows record real admin actions that were
--   really taken.


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — inspect (read-only). Run this first and read the output.
-- ═══════════════════════════════════════════════════════════════════════════
-- Expect exactly one provider_accounts row, with facility_id already NULL
-- (036 detached it). If facility_id is NOT null, stop: something has been
-- re-linked since 036 ran and this file's assumptions no longer hold.
SELECT id, email, display_name, facility_name, facility_id, status,
       onboarding_phase, completion_pct, created_at
FROM   provider_accounts
WHERE  email = 'vision2377@gmail.com';

-- The claim(s) that will be deleted.
SELECT id, status, facility_id, completion_pct, submitted_at, created_at
FROM   facility_claims
WHERE  provider_id = (SELECT id FROM provider_accounts
                      WHERE email = 'vision2377@gmail.com');

-- The license scans that will be deleted, if any.
SELECT id, name, created_at
FROM   storage.objects
WHERE  bucket_id = 'provider-documents'
  AND  (storage.foldername(name))[1] IN (
         SELECT id::text FROM facility_claims
         WHERE provider_id = (SELECT id FROM provider_accounts
                              WHERE email = 'vision2377@gmail.com')
       );

-- The auth user that will be deleted.
SELECT id, email, created_at, last_sign_in_at
FROM   auth.users
WHERE  email = 'vision2377@gmail.com';

-- Retained on purpose — listed so you can see what the audit trail keeps.
-- entity_id is text, hence ::text on the other side of every comparison.
SELECT id, action, entity_type, entity_id, created_at
FROM   audit_log
WHERE  entity_id IN (
         SELECT id::text FROM provider_accounts WHERE email = 'vision2377@gmail.com'
         UNION ALL
         SELECT id::text FROM facility_claims
         WHERE provider_id = (SELECT id FROM provider_accounts
                              WHERE email = 'vision2377@gmail.com')
       )
ORDER BY created_at;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — delete. Run only after STEP 1 confirms the state above.
-- ═══════════════════════════════════════════════════════════════════════════
BEGIN;

-- 1. License scans. Resolved through facility_claims, which still exists at
--    this point — that ordering is the reason storage comes first.
--
--    CAVEAT: deleting from storage.objects removes the row that makes the
--    file reachable through the Storage API, which is what matters here. In
--    some Supabase configurations the underlying S3 object is not reclaimed
--    by a direct SQL delete. If you want the bytes gone too, delete the
--    folder from Storage in the dashboard instead of running this statement,
--    then continue from step 2.
DELETE FROM storage.objects
WHERE  bucket_id = 'provider-documents'
  AND  (storage.foldername(name))[1] IN (
         SELECT id::text FROM facility_claims
         WHERE provider_id = (SELECT id FROM provider_accounts
                              WHERE email = 'vision2377@gmail.com')
       );

-- 2. Claims.
DELETE FROM facility_claims
WHERE  provider_id = (SELECT id FROM provider_accounts
                      WHERE email = 'vision2377@gmail.com');

-- 3. Provider account. Guarded on facility_id IS NULL so this cannot fire if
--    the account has been re-linked to a real listing since 036.
DELETE FROM provider_accounts
WHERE  email = 'vision2377@gmail.com'
  AND  facility_id IS NULL;

-- 4. Auth user.
DELETE FROM auth.users
WHERE  email = 'vision2377@gmail.com';

COMMIT;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — verify (read-only). All four should return zero rows.
-- ═══════════════════════════════════════════════════════════════════════════
SELECT 'provider_accounts' AS table_name, count(*) AS remaining
FROM   provider_accounts WHERE email = 'vision2377@gmail.com'
UNION ALL
SELECT 'auth.users', count(*)
FROM   auth.users WHERE email = 'vision2377@gmail.com'
UNION ALL
SELECT 'facility_claims (orphaned)', count(*)
FROM   facility_claims c
WHERE  NOT EXISTS (SELECT 1 FROM provider_accounts p WHERE p.id = c.provider_id)
UNION ALL
SELECT 'facilities named test-center', count(*)
FROM   facilities WHERE slug = 'test-center';

NOTIFY pgrst, 'reload schema';
