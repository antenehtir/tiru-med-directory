-- 050 — put back the two specialty names 048 should not have split
-- ═══════════════════════════════════════════════════════════════════════════
-- APPLIED 2026-09-07. Confirmed by querying live data afterwards, not by the
-- presence of this file: 0 bare halves remain in facilities or claims, all
-- three affected facilities now hold both compound names, and every service
-- count is unchanged (Ethio-Istanbul 103, Hallelujah 105, Lancet 105) — which
-- is the proof that this was a rename and not a merge.
--
-- Migration 048 turned two compound department names into bare second halves:
--
--   "Pulmonology and critical care medicine"  ->  "Critical Care Medicine"
--   "Gastroenterology and Hepatology"         ->  "Hepatology"
--
-- The reasoning was that the parent half was already ticked, so only the
-- missing half needed adding. That was wrong. A provider writes "Pulmonology
-- and Critical Care Medicine" because that is the name of one department, not
-- because they are listing two things and happened to join them with "and".
-- Offering "Critical Care Medicine" alone on the checklist asks a question no
-- department answers, and the public specialty list then showed a facility
-- claiming a standalone critical-care service it never described.
--
-- This is a straight 1-to-1 rename, not a merge: nothing is combined and
-- nothing is dropped. A facility that also ticked plain "Pulmonology" or
-- "Gastroenterology" keeps that too, which is correct — a hospital can run a
-- general pulmonology clinic AND a combined pulmonology/critical-care
-- department, and both remain separately tickable in SPECIALTIES.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- WHO IS AFFECTED, MEASURED BEFORE WRITING THIS
--
-- These strings are NOT only on the row 048 touched. Three facilities carry
-- each, and two of them predate 048 entirely — they arrived with the import,
-- which is why matching on the value rather than on Lancet's id matters:
--
--   "Critical Care Medicine"  ->  Ethio-Istanbul, Hallelujah, Lancet   (3)
--   "Hepatology"              ->  Ethio-Istanbul, Hallelujah, Lancet   (3)
--
-- Expect UPDATE 3 from each statement, or fewer if a row already holds the
-- compound name. Re-running is harmless: once renamed, nothing matches.
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 0 — DRY RUN. Changes nothing. Run first.
-- Expect 3 rows, each listing the bare half it currently holds.
-- ═══════════════════════════════════════════════════════════════════════════

select f.name,
       array(select unnest(f.services)
             intersect
             select unnest(array['Critical Care Medicine', 'Hepatology'])) as bare_halves,
       cardinality(f.services) as service_count
from   facilities f
where  f.services && array['Critical Care Medicine', 'Hepatology']
order  by f.name;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — rename the two halves to their department names.
--
-- array_replace is exactly a 1-to-1 substitution in place: order is preserved,
-- length is unchanged, and a row that does not hold the value is untouched.
-- The `&&` guard keeps the statement from rewriting all 108 rows to identical
-- values just to report a large UPDATE count.
--
-- Result: UPDATE 3
-- ═══════════════════════════════════════════════════════════════════════════

update facilities
set    services = array_replace(services, 'Critical Care Medicine', 'Pulmonology and Critical Care Medicine')
where  services && array['Critical Care Medicine'];

-- Result: UPDATE 3
update facilities
set    services = array_replace(services, 'Hepatology', 'Gastroenterology and Hepatology')
where  services && array['Hepatology'];


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — the same two values on pending claims, so an approval cannot
-- reintroduce the split name after this has run.
--
-- Expect: UPDATE 0 or more — measured as 0 at the time of writing, since the
-- only claim that held them (Lancet) is already approved and its values live
-- in `facilities`. Included anyway because a claim written between now and
-- running this would otherwise carry the old name through approval.
-- ═══════════════════════════════════════════════════════════════════════════

update facility_claims
set    proposed_services = array_replace(proposed_services, 'Critical Care Medicine', 'Pulmonology and Critical Care Medicine')
where  proposed_services && array['Critical Care Medicine'];

update facility_claims
set    proposed_services = array_replace(proposed_services, 'Hepatology', 'Gastroenterology and Hepatology')
where  proposed_services && array['Hepatology'];


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY — run after. All three must pass.
-- ═══════════════════════════════════════════════════════════════════════════

-- V1. No bare half survives anywhere. Expect 0 rows.
--
--   select name, s.val
--   from   facilities f, lateral unnest(f.services) s(val)
--   where  s.val in ('Critical Care Medicine', 'Hepatology')
--   union all
--   select proposed_name, s.val
--   from   facility_claims c, lateral unnest(c.proposed_services) s(val)
--   where  s.val in ('Critical Care Medicine', 'Hepatology');

-- V2. The three facilities now carry the compound names. Expect 3 rows each
--     holding both compound values.
--
--   select f.name,
--          array(select unnest(f.services)
--                intersect
--                select unnest(array['Pulmonology and Critical Care Medicine',
--                                    'Gastroenterology and Hepatology'])) as paired
--   from   facilities f
--   where  f.services && array['Pulmonology and Critical Care Medicine',
--                              'Gastroenterology and Hepatology']
--   order  by f.name;

-- V3. Nothing was added or lost — a rename cannot change the count.
--     Expect Lancet 105, unchanged from 048.
--
--   select name, cardinality(services)
--   from   facilities
--   where  slug in ('lancet-general-hospital',
--                   'ethio-istanbul-general-hospital',
--                   'hallelujah-general-hospital')
--   order  by name;
-- ═══════════════════════════════════════════════════════════════════════════
