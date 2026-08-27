-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — NOT YET APPLIED.
--
-- Removes the "Test Pharmacy" listing and everything that depends on it.
-- Confirmed by the account owner as their own test entry.
--
-- Unlike "Test center" (036/037), this record is NOT an empty shell — it
-- carries 10 coherent pharmacy services, working hours, payment methods,
-- languages, patient groups, real Nifas Silk-Lafto coordinates, free text that
-- reads like a person describing a real place, and TWO UPLOADED LICENCE
-- DOCUMENTS with issue and expiry dates. It is being deleted on the owner's
-- word that it is a test entry, not because the data looks fake. Read STEP 1's
-- output before running STEP 2; if any of it looks like a business you did not
-- create, stop.
--
-- Identifiers (captured 2026-08-27):
--   facility          6c77c703-6e36-414c-9885-13634a9f0684  slug 'test-pharmacy'
--   provider account  10251473-1ee6-4755-92fd-e87883140ccf  tirusew.leul@gmail.com
--   claim             710baddd-bbda-4f68-87c3-d6fdf85a7a27  status 'approved'
--
-- ── Convention ─────────────────────────────────────────────────────────────
-- Same as 037: every statement is live SQL, nothing commented out. STEP 1 is
-- read-only and safe on its own; STEP 2 is the destructive part in a single
-- transaction. Run STEP 1, read the output, then run STEP 2.
--
-- ── What depends on this row ───────────────────────────────────────────────
--   facility_claims.facility_id     one row. ON DELETE behaviour is not
--                                   defined anywhere in this repo, so the
--                                   claim is deleted explicitly, first.
--   provider_accounts.facility_id   one row. FK is `on delete set null`
--                                   (migration 011), which would silently
--                                   leave an approved account pointing at
--                                   nothing — the corruption 031 repairs. It
--                                   is deleted explicitly instead.
--   auth.users                      provider_accounts.id is
--                                   `references auth.users (id) on delete
--                                   cascade`, so the auth user is removed last
--                                   and would take the account with it anyway.
--                                   Deleting the account without the auth user
--                                   would let that login create a fresh empty
--                                   provider account on next sign-in.
--   facilities.doctors              the single doctor entry is embedded JSONB
--                                   on the facility row (every field blank),
--                                   not a separate table row. It goes with the
--                                   facility. Same for the claim's
--                                   proposed_doctors.
--   public.doctors                  a separate doctors table DOES exist, but it
--                                   links to facilities only by the free-text
--                                   column facility_name_public — there is no
--                                   foreign key, so this delete cannot orphan
--                                   it at the database level. STEP 1 checks for
--                                   a profile naming this facility anyway,
--                                   because such a row would be left pointing
--                                   at a listing that no longer exists. I could
--                                   not run that check from here: the table
--                                   denies permission even to service_role.
--   audit_log                       LEFT ALONE, deliberately. Polymorphic
--                                   (entity_type + entity_id, no FK) and
--                                   entity_id is TEXT, so every comparison
--                                   needs an explicit ::text cast — see the
--                                   note in 036. History outlives the thing it
--                                   describes.
--
-- ── Storage: two real files, delete them by hand ───────────────────────────
-- The facility itself has NO images: photo_url NULL, photo_urls [], logo_url
-- NULL, proposed_entrance_photo_urls [], and the one doctor entry's photo_url
-- is an empty string. Nothing to clean up in the image buckets.
--
-- The CLAIM, however, has two genuine uploads in the private
-- provider-documents bucket, keyed by claim id (Step5MediaForm.tsx writes
-- claimId/<name>.<ext>):
--
--   provider-documents/710baddd-bbda-4f68-87c3-d6fdf85a7a27/license.png
--   provider-documents/710baddd-bbda-4f68-87c3-d6fdf85a7a27/business-license.png
--
-- DELETE THESE FROM THE STORAGE DASHBOARD, not from here. A DELETE against
-- storage.objects removes the row that makes a file reachable through the
-- Storage API, but in some Supabase configurations the underlying S3 object is
-- not reclaimed — so the bytes of a licence scan would survive a SQL-only
-- delete. Removing the folder in the dashboard removes both. Do it after
-- STEP 2 succeeds; the paths are recorded here because once the claim row is
-- gone there is nothing left to derive the folder name from.
--
-- ── The third contact address is NOT freed by this delete ──────────────────
-- The facility's contact email, antenehmekuria0@gmail.com, is a third address
-- distinct from both the provider account (tirusew.leul@gmail.com) and the
-- owner. It was checked against the rest of the database before writing this:
--   facilities         only this row
--   provider_accounts  no rows
--   facility_claims    TWO rows — this claim AND claim
--                      2ddd57fb-51af-469c-9ee3-a01074381142, proposed_name
--                      "Test center", which belongs to the vision2377@gmail.com
--                      account that migration 037 removes.
-- So the address survives this migration and is only fully gone once 037 has
-- also run. The same reused contact address on both test submissions is itself
-- corroboration that the two records share an author.
-- The facility's phone, +251913516007, appears on no other facility.


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — inspect (read-only). Run this first and read every result.
-- ═══════════════════════════════════════════════════════════════════════════

-- The facility row itself.
SELECT id, slug, name, category, sub_city, area, phone, email, is_active,
       verification_status, record_number, created_at
FROM   facilities
WHERE  slug = 'test-pharmacy';

-- Its embedded doctor entry — expect one object with every field blank.
SELECT jsonb_array_length(doctors) AS doctor_entries, doctors
FROM   facilities
WHERE  slug = 'test-pharmacy';

-- Its images — expect all empty, i.e. nothing to clean up in the photo buckets.
SELECT photo_url, logo_url, photo_urls
FROM   facilities
WHERE  slug = 'test-pharmacy';

-- The provider account.
SELECT id, email, display_name, facility_name, facility_id, status,
       onboarding_phase, completion_pct, created_at
FROM   provider_accounts
WHERE  email = 'tirusew.leul@gmail.com';

-- The claim, including the two licence documents and their dates.
SELECT id, provider_id, facility_id, status, completion_pct, proposed_name,
       proposed_email, proposed_license_url, proposed_license_issue_date,
       proposed_license_expiry_date, proposed_business_license_url,
       proposed_business_license_issue_date, proposed_business_license_expiry_date,
       submitted_at, created_at
FROM   facility_claims
WHERE  provider_id = (SELECT id FROM provider_accounts
                      WHERE email = 'tirusew.leul@gmail.com');

-- Storage objects keyed by that claim id. Expect the two licence PNGs listed
-- in the header. Anything extra here must also be removed by hand.
SELECT id, bucket_id, name, created_at
FROM   storage.objects
WHERE  bucket_id = 'provider-documents'
  AND  (storage.foldername(name))[1] IN (
         SELECT id::text FROM facility_claims
         WHERE provider_id = (SELECT id FROM provider_accounts
                              WHERE email = 'tirusew.leul@gmail.com')
       );

-- Any object in the image buckets that mentions this facility's id or slug.
-- Expect zero rows; the facility carries no images.
SELECT id, bucket_id, name
FROM   storage.objects
WHERE  bucket_id IN ('facility-photos', 'doctor-photos')
  AND  (name LIKE '%6c77c703-6e36-414c-9885-13634a9f0684%'
        OR name LIKE '%test-pharmacy%');

-- Soft, text-only link: a doctor profile naming this facility. No FK exists,
-- so this cannot block the delete — but such a row would be left naming a
-- listing that is gone, and should be handled separately.
SELECT id, slug, display_name, facility_name_public, listing_status
FROM   doctors
WHERE  facility_name_public ILIKE '%Test Pharmacy%';

-- The auth user.
SELECT id, email, created_at, last_sign_in_at
FROM   auth.users
WHERE  email = 'tirusew.leul@gmail.com';

-- Retained on purpose. entity_id is TEXT, hence ::text on the other side.
SELECT id, action, entity_type, entity_id, created_at
FROM   audit_log
WHERE  entity_id IN (
         SELECT id::text FROM facilities WHERE slug = 'test-pharmacy'
         UNION ALL
         SELECT id::text FROM provider_accounts WHERE email = 'tirusew.leul@gmail.com'
         UNION ALL
         SELECT id::text FROM facility_claims
         WHERE provider_id = (SELECT id FROM provider_accounts
                              WHERE email = 'tirusew.leul@gmail.com')
       )
ORDER BY created_at;

-- Confirms the shared contact address described in the header: expect the
-- "Test center" claim alongside this one.
SELECT id, proposed_name, proposed_email, status
FROM   facility_claims
WHERE  proposed_email = 'antenehmekuria0@gmail.com';


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — delete. Run only after STEP 1 confirms the state above.
-- ═══════════════════════════════════════════════════════════════════════════
-- Dependants first, facility next, auth user last.
BEGIN;

-- 1. The claim. Removes its reference to the facility before the facility goes.
DELETE FROM facility_claims
WHERE  provider_id = (SELECT id FROM provider_accounts
                      WHERE email = 'tirusew.leul@gmail.com');

-- 2. The provider account. Guarded on the facility it is supposed to own, so
--    this cannot fire if the account has since been re-pointed elsewhere.
DELETE FROM provider_accounts
WHERE  email = 'tirusew.leul@gmail.com'
  AND  facility_id = (SELECT id FROM facilities WHERE slug = 'test-pharmacy');

-- 3. The facility. Guarded on the category so a differently-typed row that
--    later takes this slug cannot be removed by a stale re-run.
DELETE FROM facilities
WHERE  slug = 'test-pharmacy'
  AND  category = 'Pharmacy';

-- 4. The auth user. Cascades to provider_accounts, which step 2 has already
--    removed; this is what stops that login from recreating an empty account.
DELETE FROM auth.users
WHERE  email = 'tirusew.leul@gmail.com';

COMMIT;


-- ═══════════════════════════════════════════════════════════════════════════
-- MANUAL — after STEP 2 commits
-- ═══════════════════════════════════════════════════════════════════════════
-- In the Supabase dashboard, Storage → provider-documents, delete the folder
--   710baddd-bbda-4f68-87c3-d6fdf85a7a27/
-- containing license.png and business-license.png. Doing it there removes the
-- object rows and the stored bytes; a SQL delete may leave the bytes behind.


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — verify (read-only).
-- ═══════════════════════════════════════════════════════════════════════════
-- The first five rows must all read 0. The audit_log count must match what
-- STEP 1 printed — that is the point of listing it here: it proves the history
-- was retained rather than swept up with the record.
SELECT 'facility "test-pharmacy"' AS check_name, count(*) AS remaining
FROM   facilities WHERE slug = 'test-pharmacy'
UNION ALL
SELECT 'provider_accounts tirusew.leul@gmail.com', count(*)
FROM   provider_accounts WHERE email = 'tirusew.leul@gmail.com'
UNION ALL
SELECT 'auth.users tirusew.leul@gmail.com', count(*)
FROM   auth.users WHERE email = 'tirusew.leul@gmail.com'
UNION ALL
SELECT 'the claim row', count(*)
FROM   facility_claims
WHERE  id = '710baddd-bbda-4f68-87c3-d6fdf85a7a27'
UNION ALL
SELECT 'orphaned claims (any provider)', count(*)
FROM   facility_claims c
WHERE  NOT EXISTS (SELECT 1 FROM provider_accounts p WHERE p.id = c.provider_id)
UNION ALL
SELECT 'audit_log entries RETAINED (expect the STEP 1 count)', count(*)
FROM   audit_log
WHERE  entity_id IN ('6c77c703-6e36-414c-9885-13634a9f0684',
                     '10251473-1ee6-4755-92fd-e87883140ccf',
                     '710baddd-bbda-4f68-87c3-d6fdf85a7a27');

-- Active facility count should drop by exactly one, from 107 to 106. The
-- homepage's mapped count drops from 104 to 103: this row had coordinates and
-- was not online-only, so it counted toward the trust line.
SELECT count(*) AS active_facilities FROM facilities WHERE is_active = true;

NOTIFY pgrst, 'reload schema';
