-- 051 — move the solo specialty halves onto their department names
-- ═══════════════════════════════════════════════════════════════════════════
-- DRAFT. Not run.
--
-- The checklist offered both a department and one of its halves:
--
--   Gastroenterology   AND  Gastroenterology and Hepatology
--   Pulmonology        AND  Pulmonology and Critical Care Medicine
--
-- which reads as a duplicate and invites a provider to tick both — nine
-- facilities had ticked both halves of the first pair, seven of the second.
-- The solo entries are gone from SPECIALTIES, so this moves the rows that
-- still hold them.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- ⚠ THIS ONE ASSERTS SOMETHING, AND THAT WAS A DELIBERATE CALL
--
-- For most of the affected rows the merge is lossless: they already carry the
-- compound and the solo is simply redundant, so removing it changes nothing a
-- reader sees.
--
-- But not for all of them. Measured before writing:
--
--   Gastroenterology   9 facilities — 4 already have the compound, 5 do NOT
--   Pulmonology        7 facilities — 4 already have the compound, 3 do NOT
--
-- Those 5 and 3 are 8 claims across FIVE distinct facilities — three of them
-- hold only the solo of both pairs and so gain both compounds:
--
--   Silkroad General Hospital              gastro + pulmo
--   Gesund Cardiac and Medical Center      gastro + pulmo
--   Habari Medical Plaza                   gastro + pulmo
--   Heal Venture Medical and Surgical      gastro
--   American Medical & MCH Center          gastro
--
-- None of them claimed a combined department. Moving them onto the compound
-- says something about them they did not say about themselves. This was raised
-- with the numbers in hand and the merge was chosen anyway, so it is recorded
-- here rather than buried: if one of these five later says it does not run a
-- combined unit, this migration is why its listing says it does.
--
-- Family Medicine is handled differently in STEP 3 — it has no department form
-- to merge into, so its data is preserved rather than reassigned.
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 0 — DRY RUN. Changes nothing. Run first.
-- Expect: 9 rows — the two sets overlap, so a facility holding both solos is
-- one row, not two. gains_a_claim = true on exactly 5 of them.
-- ═══════════════════════════════════════════════════════════════════════════

select f.name,
       case when f.services && array['Gastroenterology'] then 'Gastroenterology' end as solo_gastro,
       case when f.services && array['Pulmonology'] then 'Pulmonology' end as solo_pulmo,
       (f.services && array['Gastroenterology'] and not f.services && array['Gastroenterology and Hepatology'])
       or (f.services && array['Pulmonology'] and not f.services && array['Pulmonology and Critical Care Medicine'])
         as gains_a_claim
from   facilities f
where  f.services && array['Gastroenterology', 'Pulmonology']
order  by gains_a_claim desc, f.name;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — add the department where only the half is held.
--
-- Runs BEFORE the removal in STEP 2. Reversing the order would delete the
-- solo first and leave those five facilities with neither.
--
-- Expect: UPDATE 5, then UPDATE 3
-- ═══════════════════════════════════════════════════════════════════════════

update facilities
set    services = array_append(services, 'Gastroenterology and Hepatology')
where  services && array['Gastroenterology']
  and  not services && array['Gastroenterology and Hepatology'];

update facilities
set    services = array_append(services, 'Pulmonology and Critical Care Medicine')
where  services && array['Pulmonology']
  and  not services && array['Pulmonology and Critical Care Medicine'];


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — drop the solo halves, now that every row holding one also holds
-- the department.
--
-- Expect: UPDATE 9, then UPDATE 7
-- ═══════════════════════════════════════════════════════════════════════════

update facilities
set    services = array_remove(services, 'Gastroenterology')
where  services && array['Gastroenterology'];

update facilities
set    services = array_remove(services, 'Pulmonology')
where  services && array['Pulmonology'];


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 3 — Family Medicine: keep the fact, lose the checklist entry.
--
-- Removed from SPECIALTIES, but two facilities list it and one pending claim
-- proposes it. It has no department form to merge into, so the value stays in
-- `services` — the public page keeps showing it — and is registered as a
-- custom entry so the editor renders it as a removable chip.
--
-- Without that second half it becomes an orphan: a value counted in `services`
-- that no checklist pill can represent and no chip can remove, which is
-- exactly the "15 selected while showing 10" bug this project already fixed
-- once. Appending rather than replacing preserves any custom entries a row
-- already has (Ethio-Istanbul has two).
--
-- Expect: UPDATE 2
-- ═══════════════════════════════════════════════════════════════════════════

update facilities f
set    custom_service_categories = jsonb_set(
         coalesce(f.custom_service_categories, '{}'::jsonb),
         '{specialty}',
         coalesce(f.custom_service_categories -> 'specialty', '[]'::jsonb)
           || '["Family Medicine"]'::jsonb,
         true
       )
where  f.services && array['Family Medicine']
  and  not coalesce(f.custom_service_categories -> 'specialty', '[]'::jsonb)
           @> '["Family Medicine"]'::jsonb;

-- The same for the one pending claim, so approval does not reintroduce an
-- orphan. Expect: UPDATE 1
update facility_claims c
set    proposed_custom_service_categories = jsonb_set(
         coalesce(c.proposed_custom_service_categories, '{}'::jsonb),
         '{specialty}',
         coalesce(c.proposed_custom_service_categories -> 'specialty', '[]'::jsonb)
           || '["Family Medicine"]'::jsonb,
         true
       )
where  c.proposed_services && array['Family Medicine']
  and  not coalesce(c.proposed_custom_service_categories -> 'specialty', '[]'::jsonb)
           @> '["Family Medicine"]'::jsonb;


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY — run after. All four must pass.
-- ═══════════════════════════════════════════════════════════════════════════

-- V1. No solo half survives. Expect 0 rows.
--
--   select name, s.val
--   from   facilities f, lateral unnest(f.services) s(val)
--   where  s.val in ('Gastroenterology', 'Pulmonology');

-- V2. Every facility that held one now holds the department. Expect 9 and 7.
--
--   select count(*) filter (where services && array['Gastroenterology and Hepatology']) as gastro,
--          count(*) filter (where services && array['Pulmonology and Critical Care Medicine']) as pulmo
--   from   facilities;

-- V3. Family Medicine is still listed publicly AND is now a removable chip.
--     Expect 2 rows, each with the value in both columns.
--
--   select name,
--          services && array['Family Medicine'] as still_listed,
--          custom_service_categories -> 'specialty' as custom_entries
--   from   facilities
--   where  services && array['Family Medicine'];

-- V4. Nothing else moved — service counts change only by the merge.
--     A row that gained a department is +1 then -1 = unchanged for that pair;
--     a row that already had both is -1. Expect the five named above unchanged
--     and the rest down by one per pair they held.
--
--   select name, cardinality(services) from facilities
--   where  services && array['Gastroenterology and Hepatology',
--                            'Pulmonology and Critical Care Medicine']
--   order  by name;
-- ═══════════════════════════════════════════════════════════════════════════
