-- 053 — retire the special_services column into services
-- ═══════════════════════════════════════════════════════════════════════════
-- DRAFT. Not run.
--
-- special_services is a leftover from the original CSV import. Nothing in the
-- current admin editor or provider onboarding form reads it, writes it, or
-- shows it as a removable pill — but get-facilities.ts still unions it into
-- every facility's public services list. The result: an admin removes a
-- service, the services column updates, the save reports success, and the
-- public page keeps showing it anyway because the value is still sitting in
-- special_services, a column the editor cannot see or touch.
--
-- This is the Hallelujah Hospital bug reported again ("Sleep study",
-- "Ophthalmology service" would not go away) — and it was never actually
-- fixed by the earlier Next.js Data Cache patch (83de154). That patch was
-- real and necessary, but it fixed a different bug that happened to look the
-- same from the outside; this column is why removing a service in admin can
-- still fail to remove it from the public page today.
--
-- Fix has two halves. This migration is the data half: merge special_services
-- into services (deduped) and clear special_services, for every row, so the
-- column stops being a second, invisible source of truth. The code half
-- (already applied in this pass) makes the admin editor load services and
-- special_services merged, so any legacy value is visible and removable
-- in the meantime, and clears special_services on every save going forward.
--
-- facility_claims.proposed_special_services is not touched — measured at
-- zero non-null rows, and nothing writes it, so there is nothing to merge.
--
-- ⚠ COUNTS AGE. Measured shortly before writing this, and the database is
-- edited continuously. STEP 0 is the authority — if it disagrees with the
-- numbers below, believe STEP 0 and re-derive the rest.
--
--   15 facilities, 30 distinct stranded values (values in special_services
--   not already present in services) — Amin General Hospital, ACL ENT and
--   Medical Center, Bethzatha, Hallelujah, Yerer, Careland, Yanet, Heal
--   Venture, Meqrez, Kadisco, St. Gabriel, Medstar, Ethio-Istanbul, Girum,
--   British Pediatrics Center.
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 0 — DRY RUN. Changes nothing. Run first.
-- Expect: 15 rows, one per facility above, listing what would be added to
-- services and confirming special_services would then be cleared.
-- ═══════════════════════════════════════════════════════════════════════════

select f.name,
       array(select unnest(f.special_services)
             except
             select unnest(f.services)) as would_add_to_services,
       f.special_services as current_special_services
from   facilities f
where  array(select unnest(f.special_services)
             except
             select unnest(coalesce(f.services, array[]::text[]))) <> array[]::text[]
order  by f.name;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — merge and clear, for every row (not only the 15 the dry run
-- lists — this also zeroes out special_services on rows where it already
-- duplicates services, so the column is retired everywhere, not patched
-- selectively).
--
-- Expect: UPDATE 110 — every row is touched because every row's
-- special_services is set to '{}', even the ones already empty. 110 is the
-- total facility count measured alongside STEP 0; if the count has moved,
-- that is fine — this step is meant to touch every row regardless.
-- ═══════════════════════════════════════════════════════════════════════════

update facilities f
set    services = (
         select array(
           select distinct unnest(
             coalesce(f.services, array[]::text[]) || coalesce(f.special_services, array[]::text[])
           )
         )
       ),
       special_services = array[]::text[];


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY — run after. Both must pass.
-- ═══════════════════════════════════════════════════════════════════════════

-- V1. Nothing left in special_services anywhere. Expect 0 rows.
--
--   select name from facilities where coalesce(array_length(special_services, 1), 0) > 0;

-- V2. Every one of STEP 0's fifteen facilities now carries its stranded
--     values inside services. Expect exactly 2 rows: Hallelujah with both
--     "Sleep study" and "Ophthalmology service" (t, t) and Yerer with both
--     "Dialysis" and "MRI" (t, t) — the two rows whose stranded values this
--     query happens to spot-check. A 15-row general version would repeat
--     STEP 0's own array-except logic, which is circular as a check; this
--     spot-checks two by name instead.
--
--   select name,
--          services @> array['Sleep study'] as has_sleep_study,
--          services @> array['Ophthalmology service'] as has_ophthalmology
--   from   facilities where name = 'Hallelujah General Hospital'
--   union all
--   select name,
--          services @> array['Dialysis'],
--          services @> array['MRI']
--   from   facilities where name = 'Yerer General Hospital';
-- ═══════════════════════════════════════════════════════════════════════════
