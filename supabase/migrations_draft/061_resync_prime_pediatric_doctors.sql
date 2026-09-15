-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- CONTEXT: the provider added French to Dr Kale-Ab Tesfaye's languages on
-- 2026-09-15. It never reached the public page, and nothing was logged.
--
-- Cause was a bug introduced the same day, in the change detection added to
-- syncToFacilityIfApproved: detection compared the DISPLAY text of each
-- field rather than the values themselves, and the display reduction for an
-- object array is just the item names. A doctor's name did not change, so
-- the whole doctors array read as unchanged — and because the sync had been
-- made conditional on "something changed", the write was skipped entirely.
-- A lossy comparison was deciding whether to write.
--
-- Both halves are fixed in code: detection now deep-compares raw values
-- (key-order independent, blank-equivalent), and the write is no longer
-- conditional on detection at all — detection decides only whether to LOG.
-- If it is ever wrong again the cost is a missing log line, not lost data.
--
-- This migration catches up the one row stuck by the bug. A full drift audit
-- across every approved claim was run immediately before writing this file:
-- Prime Pediatric's `doctors` is the only field on the only affected
-- facility, and languages is the only field within it that differs.
--
-- Verified live before writing:
--   facilities (b42a5a89...).doctors[0].languages         = ["Amharic","English"]
--   facility_claims (90549a2e...).proposed_doctors[0]     = ["Amharic","English","French"]
--   the two doctor objects are otherwise byte-identical.

UPDATE facilities f
SET
  doctors = fc.proposed_doctors,
  updated_at = now()
FROM facility_claims fc
WHERE f.slug = 'prime-pediatric-clinic'
  AND fc.facility_id = f.id
  AND fc.status = 'approved';

NOTIFY pgrst, 'reload schema';
