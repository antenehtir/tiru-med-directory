-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — NOT YET APPLIED.
--
-- Removes eight test records from public.diagnostic_providers.
--
-- All eight follow the pattern "Test Diagnostic <Greek letter> <type>", e.g.
-- Alpha Laboratory, Eta Imaging Center, Zeta Radiology Center, Omega Pathology
-- Service. They are the entire contents of the table: the STEP 1 count of rows
-- NOT matching the prefix returns 0, so this is not a case of test rows mixed
-- in with real ones.
--
-- This header first said six. That was a stale count written before the table
-- was inspected, and it was wrong: STEP 1 against the live database returned
-- eight. The discrepancy never affected correctness, because the delete has
-- always been guarded on the name prefix rather than on an enumerated list of
-- ids — the guard matches whatever rows carry the prefix, and STEP 1's
-- rows_that_are_not_test_records = 0 is what authorises it, not the total.
-- Do not reintroduce a hardcoded count here or in STEP 2; the row total is an
-- observation to read from STEP 1, never a constant to trust.
--
-- They are live in the sense that matters least and worst: listing_status
-- 'active' and visibility_status 'public', which is exactly what a public read
-- path would filter ON. Nothing reads the table today — grep across src/,
-- scripts/ and supabase/ returns no references, and the one helper that used to
-- query it (diagnostics-public-read.ts) has been deleted along with its probe
-- scripts, because /diagnostics reads getFacilitiesFromDB() like every other
-- listing surface. So these rows are invisible right now. The risk is a future
-- read path picking the table back up and publishing eight fake laboratories.
--
-- The table itself is deliberately LEFT IN PLACE. Emptying it is reversible and
-- proportionate; dropping a table this migration did not create is not.

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — inspect (read-only). Run this first and read the output.
-- ═══════════════════════════════════════════════════════════════════════════

-- Every row, so the test records can be confirmed as the whole table. Read the
-- row count off this result rather than assuming the number in the header.
SELECT id, display_name, slug, listing_status, visibility_status, created_at
FROM   diagnostic_providers
ORDER  BY display_name;

-- The safety check that makes the delete in STEP 2 safe to run blind:
-- this must return 0. If it returns anything, a real listing has been added
-- since this file was written — stop, and narrow the delete to explicit ids.
SELECT count(*) AS rows_that_are_not_test_records
FROM   diagnostic_providers
WHERE  display_name NOT ILIKE 'Test Diagnostic %';

-- Anything elsewhere pointing at these rows. Expect zero: no foreign key to
-- this table is defined in this repo, and no application code reads it.
SELECT c.conname, c.conrelid::regclass AS referencing_table
FROM   pg_constraint c
WHERE  c.confrelid = 'public.diagnostic_providers'::regclass;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — delete. Run only after STEP 1 confirms the count above is 0.
-- ═══════════════════════════════════════════════════════════════════════════
-- Guarded on the name prefix rather than an enumerated list of ids, so a row
-- added since this file was written cannot be caught by it — and so the count
-- of matching rows never has to be known in advance.
BEGIN;

DELETE FROM diagnostic_providers
WHERE  display_name ILIKE 'Test Diagnostic %';

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — verify (read-only). Both counts must read 0.
-- ═══════════════════════════════════════════════════════════════════════════
SELECT 'test records remaining' AS check_name, count(*) AS remaining
FROM   diagnostic_providers WHERE display_name ILIKE 'Test Diagnostic %'
UNION ALL
SELECT 'rows left in the table', count(*)
FROM   diagnostic_providers;

NOTIFY pgrst, 'reload schema';
