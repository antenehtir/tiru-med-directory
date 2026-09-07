-- 049 — remove the licence documents Tiru no longer collects
-- ═══════════════════════════════════════════════════════════════════════════
-- APPLIED 2026-09-07. Confirmed by querying live data afterwards, not by the
-- presence of this file: 0 claims hold a licence URL or expiry date, the
-- provider-documents bucket holds 0 files, the bucket itself still exists, and
-- both affected claims are still approved with their facility links intact.
--
-- Licence upload has been removed from onboarding and licence review from
-- admin. Nothing in the application now reads these columns or these files, so
-- what is left behind is private document scans with no purpose and no
-- interface — the worst kind of retained personal data.
--
-- Scope confirmed 2026-09-07: ALL THREE provider-documents folders go, not
-- just Prime's. The other two are a test account and an orphan, and after the
-- code change none of the three is reachable from any screen.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- WHAT IS *NOT* DROPPED, AND WHY
--
-- The six columns stay:
--
--   proposed_license_url / _issue_date / _expiry_date
--   proposed_business_license_url / _issue_date / _expiry_date
--
-- Dropping them would architect out the ability for an admin to ask a
-- provider for a document later, which is explicitly still wanted. They are
-- emptied, not deleted. The `provider-documents` bucket and the
-- `uploadToBucket` helper stay for the same reason.
--
-- `facilities` needs no change at all: it never had licence columns. That was
-- deliberate — it is the publicly-readable table.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- WHAT IS THERE, MEASURED IMMEDIATELY BEFORE WRITING THIS
--
--   folder / claim id                       claim row              files
--   90549a2e-c583-4836-a7fa-45dd75dd852e    Prime Pediatric Clinic  license.jpg, business-license.jpg
--   2ddd57fb-51af-469c-9ee3-a01074381142    "Test center"           license.pdf, business-license.pdf
--   710baddd-bbda-4f68-87c3-d6fdf85a7a27    NONE — orphan           license.png, business-license.png
--
-- The orphan is the test pharmacy migration 038 removed. 038's own header
-- warned that a SQL-only delete leaves the bytes behind; these two files are
-- the evidence it was right. It has no claim row at all, so STEP 1 cannot and
-- need not touch it — it was only ever a storage problem.
--
-- So: STEP 1 updates 2 rows; the storage side removes 6 files.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- ⚠ THE FILES CANNOT BE DELETED FROM SQL AT ALL
--
-- An earlier draft of this file ended in
--
--   delete from storage.objects where bucket_id = 'provider-documents';
--
-- That is not merely unwise, it is refused:
--
--   ERROR 42501: Direct deletion from storage tables is not allowed.
--                Use the Storage API instead.
--   CONTEXT: PL/pgSQL function storage.protect_delete()
--
-- Supabase guards storage.objects with a trigger precisely because deleting
-- the row leaves the bytes orphaned in the storage backend. The Storage API
-- is the only path that removes object and bytes together.
--
-- So this file does the database half only. The files are deleted separately —
-- see the STORAGE section below — and the two halves are independent: STEP 1
-- can run before or after, and neither depends on the other.
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 0 — look before deleting. Changes nothing.
-- Expect 2 rows: Prime Pediatric Clinic and "Test center", both with URLs.
-- ═══════════════════════════════════════════════════════════════════════════

select id,
       proposed_name,
       status,
       proposed_license_url,
       proposed_business_license_url
from   facility_claims
where  proposed_license_url is not null
   or  proposed_business_license_url is not null
order  by proposed_name;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — clear every licence reference on facility_claims.
--
-- Matched on "holds a licence URL" rather than on a list of ids: the ids were
-- correct when this was written, but the condition stays correct if another
-- row acquires one before this runs. Re-running is harmless — after the first
-- pass nothing matches.
--
-- Result: UPDATE 2
-- ═══════════════════════════════════════════════════════════════════════════

update facility_claims
set    proposed_license_url                   = null,
       proposed_license_issue_date            = null,
       proposed_license_expiry_date           = null,
       proposed_business_license_url          = null,
       proposed_business_license_issue_date   = null,
       proposed_business_license_expiry_date  = null
where  proposed_license_url is not null
   or  proposed_business_license_url is not null;


-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE — not SQL. Six files across three folders.
--
--   Supabase Dashboard → Storage → provider-documents
--   → open each folder, select both files, Delete
--
--   90549a2e-c583-4836-a7fa-45dd75dd852e/   license.jpg, business-license.jpg
--   2ddd57fb-51af-469c-9ee3-a01074381142/   license.pdf, business-license.pdf
--   710baddd-bbda-4f68-87c3-d6fdf85a7a27/   license.png, business-license.png
--
-- Done via the Dashboard. A throwaway Storage API script was written as an
-- alternative and deleted afterwards; it is not needed again, and the six
-- files were already gone by the time it ran.
--
-- Delete the FILES, not the bucket: the bucket surviving is what keeps an
-- ad-hoc document request possible later.
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY — run these after. All three must pass.
-- ═══════════════════════════════════════════════════════════════════════════

-- V1. No claim holds a licence reference of any kind. Expect 0 rows.
--
--   select proposed_name,
--          proposed_license_url, proposed_license_issue_date, proposed_license_expiry_date,
--          proposed_business_license_url, proposed_business_license_issue_date,
--          proposed_business_license_expiry_date
--   from   facility_claims
--   where  proposed_license_url is not null
--      or  proposed_license_issue_date is not null
--      or  proposed_license_expiry_date is not null
--      or  proposed_business_license_url is not null
--      or  proposed_business_license_issue_date is not null
--      or  proposed_business_license_expiry_date is not null;

-- V2. The bucket is empty. Expect 0 rows.
--
--   select name from storage.objects where bucket_id = 'provider-documents';

-- V3. The bucket itself still exists, so ad-hoc document requests remain
--     possible. Expect 1 row.
--
--   select id, name, public from storage.buckets where id = 'provider-documents';

-- V4. Both claims are otherwise untouched. Expect 2 rows, both 'approved'.
--     Prime keeps its facility_id; "Test center" has facility_id NULL, which
--     is how it already was — an approved test claim that never had a
--     facility. STEP 1 sets only the six licence columns, so it cannot have
--     caused that, but it is worth knowing before reading the output.
--
--   select proposed_name, status, facility_id
--   from   facility_claims
--   where  id in ('90549a2e-c583-4836-a7fa-45dd75dd852e',
--                 '2ddd57fb-51af-469c-9ee3-a01074381142');
-- ═══════════════════════════════════════════════════════════════════════════
