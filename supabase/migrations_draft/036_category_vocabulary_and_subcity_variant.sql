-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- Two data corrections found by the category / sub-city audit.
--
-- (A) One test facility whose `category` ("Hospital") is not in
--     FACILITY_CATEGORY_DB_MAP (src/lib/frontend-search-filters.ts), so
--     resolveFacilityCardCategoryKey() resolves it to "default" and it never
--     appears under any category filter, in /facilities browse, or in the
--     homepage discovery chips.
--
--     Root cause was the provider signup form offering a vocabulary
--     ("Hospital", "Laboratory / Diagnostics") that the map does not contain,
--     with approveClaim() writing facility_type straight through to
--     facilities.category. The code side is fixed separately; this removes the
--     one row already stored that way.
--
-- (B) One sub-city spelled "gullele" where every other row uses "gulele".
--     No matching rule reconciles a doubled letter, so a search or filter for
--     one spelling misses the facility stored under the other.
--
-- DECIDED, NO ACTION HERE: two other rows also hold categories outside the
-- taxonomy — HabariDOC ("Telemedicine") and Wastina ("Healthcare Financing").
-- Both stay active and unchanged for now. Neither is a facility you physically
-- visit, so no existing category fits, and the taxonomy is not being extended
-- in this pass. Consequence to be aware of: both remain reachable by search
-- and direct link but stay absent from every category filter. Revisit if
-- telemedicine becomes a category the directory intends to grow.


-- ═══════════════════════════════════════════════════════════════════════════
-- (A) DELETE the "Test center" test record
-- ═══════════════════════════════════════════════════════════════════════════
-- This is NOT a plain DELETE — the row is referenced from other tables.
--
-- What references it, and how each is handled:
--
--   provider_accounts.facility_id  FK is `on delete set null` (migration 011),
--                                  so a delete would not fail — but it would
--                                  leave a provider account still marked
--                                  approved/verified while pointing at
--                                  nothing. That is the exact corruption
--                                  migration 031 was written to repair, so it
--                                  is detached explicitly below rather than
--                                  left to the FK.
--
--   facility_claims.facility_id    Nullable since migration 012. Its ON DELETE
--                                  behaviour is not defined anywhere in this
--                                  repo, so a delete could fail on the
--                                  constraint. Detached explicitly first.
--
--   audit_log                      Uses generic entity_type/entity_id with no
--                                  foreign key. DELIBERATELY LEFT ALONE — an
--                                  audit trail should outlive the thing it
--                                  describes, and deleting history to tidy up
--                                  a test record would be wrong.
--
-- NOTE: I could not confirm from here whether provider_accounts or
-- facility_claims rows actually exist for this facility — the anon key is
-- blocked by RLS on both tables. RUN STEP 1 FIRST and read the output before
-- running step 2.


-- ── STEP 1 — inspect (read-only; run and review before step 2) ─────────────
-- SELECT id, slug, name, category, verification_status
-- FROM   facilities
-- WHERE  slug = 'test-center';
--
-- SELECT id, email, status, verification_status_internal, facility_id
-- FROM   provider_accounts
-- WHERE  facility_id = (SELECT id FROM facilities WHERE slug = 'test-center');
--
-- SELECT id, status, facility_id, submitted_at
-- FROM   facility_claims
-- WHERE  facility_id = (SELECT id FROM facilities WHERE slug = 'test-center');
--
-- -- audit_log rows are retained on purpose; listed here only for awareness.
-- SELECT id, action, entity_type, entity_id, created_at
-- FROM   audit_log
-- WHERE  entity_type = 'facility'
--   AND  entity_id   = (SELECT id FROM facilities WHERE slug = 'test-center');


-- ── STEP 2 — detach dependants, then delete ───────────────────────────────
-- Run as one transaction so a failure part-way cannot leave dangling links.
BEGIN;

-- Detach any claim(s) pointing at this facility. facility_id NULL is the
-- supported representation of "a listing that does not exist yet"
-- (see migration 012), so this is a valid resting state for the claim.
UPDATE facility_claims
SET    facility_id = NULL
WHERE  facility_id = (SELECT id FROM facilities WHERE slug = 'test-center');

-- Detach the provider account explicitly rather than relying on the FK's
-- `set null`, so the link is removed deliberately and visibly.
UPDATE provider_accounts
SET    facility_id = NULL
WHERE  facility_id = (SELECT id FROM facilities WHERE slug = 'test-center');

DELETE FROM facilities
WHERE  slug = 'test-center'
  AND  category = 'Hospital';

COMMIT;

-- LEFT BEHIND ON PURPOSE: the provider_accounts row, its facility_claims row
-- and the auth user that owns them are test artifacts too, but removing an
-- account (and its auth.users entry) is a separate, more destructive decision
-- than removing a directory listing, so it is not bundled here. If those
-- should go as well, identify them with the STEP 1 queries above and handle
-- them in their own migration.


-- ═══════════════════════════════════════════════════════════════════════════
-- (B) sub_city "gullele" -> "gulele"   [1 row]
-- ═══════════════════════════════════════════════════════════════════════════
-- Aligns with the spelling used by every other row and by ADDIS_SUB_CITIES /
-- SUB_CITIES ("Gulele"). Before this, a user searching or filtering "Gulele"
-- found 1 of the 2 facilities actually in that sub-city, and searching
-- "Gullele" found the other. Guarded on the current value, so re-running is a
-- no-op once applied.
UPDATE facilities
SET    sub_city = 'gulele',
       updated_at = now()
WHERE  slug = 'oasis-e-n-t-head-and-neck-speciality-center'
  AND  sub_city = 'gullele';


-- ═══════════════════════════════════════════════════════════════════════════
-- Verification (run after applying)
-- ═══════════════════════════════════════════════════════════════════════════
-- Expect exactly 2 rows — HabariDOC (Telemedicine) and Wastina (Healthcare
-- Financing), both knowingly left as-is per the decision noted at the top.
-- "Test center" should no longer appear.
-- SELECT slug, name, category FROM facilities
-- WHERE is_active = true
--   AND category NOT IN (
--     'General Hospital','Specialty Center','Medical Plaza','Clinic',
--     'Healthcare Facility','Diagnostic Center','Pharmacy',
--     'Ambulance Service','Home Care'
--   );
--
-- Expect exactly 2 rows, both spelled 'gulele':
-- SELECT slug, sub_city FROM facilities
-- WHERE is_active = true AND sub_city ILIKE '%gul%ele%';
