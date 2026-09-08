-- 052 — keep four retired services visible after they leave the checklist
-- ═══════════════════════════════════════════════════════════════════════════
-- DRAFT. Not run.
--
-- Home visit, Travel medicine, Medical certificate and Blood bank are out of
-- MAIN_SERVICES. Three facilities and three pending claims still list them.
--
-- Removing a catalogue entry does NOT delete the stored value — it strands it.
-- The string stays in `services`, so the public page keeps showing it under
-- "Additional Services", but no checklist pill can represent it and no chip
-- can remove it: a service counted in the editor's total that the editor
-- cannot display. That is the "15 selected while showing 10" bug this project
-- already fixed once, and it is what 051 avoided for Family Medicine by
-- registering the value as a custom entry instead.
--
-- Same treatment here. The value stays where it is and gains a custom-category
-- entry, so the listing is unchanged for a visitor and the provider or an
-- admin can now remove it deliberately if they want to.
--
-- ⚠ COUNTS AGE. These were measured shortly before writing and this database
-- is edited continuously. STEP 0 is the authority — if it disagrees with the
-- numbers below, believe STEP 0 and re-derive the rest.
--
--   Home visit            1 facility,  2 claims
--   Travel medicine       1 facility,  2 claims
--   Medical certificate   2 facilities, 3 claims
--   Blood bank            2 facilities, 2 claims
--   distinct rows         3 facilities, 3 claims
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 0 — DRY RUN. Changes nothing. Run first.
-- Expect: 3 facility rows and 3 claim rows, listing which of the four each
-- holds and what custom entries it already has.
-- ═══════════════════════════════════════════════════════════════════════════

select 'facility' as kind,
       f.name,
       array(select unnest(f.services)
             intersect
             select unnest(array['Home visit','Travel medicine',
                                 'Medical certificate','Blood bank'])) as retiring,
       f.custom_service_categories -> 'general' as existing_general
from   facilities f
where  f.services && array['Home visit','Travel medicine',
                           'Medical certificate','Blood bank']
union all
select 'claim',
       c.proposed_name,
       array(select unnest(c.proposed_services)
             intersect
             select unnest(array['Home visit','Travel medicine',
                                 'Medical certificate','Blood bank'])),
       c.proposed_custom_service_categories -> 'general'
from   facility_claims c
where  c.proposed_services && array['Home visit','Travel medicine',
                                    'Medical certificate','Blood bank']
order  by kind, name;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — register the retired values as custom entries on facilities.
--
-- Filed under "general", which is the bucket MAIN_SERVICES entries belong to
-- in Step3ServicesForm — that is what makes them appear as removable chips in
-- the section they came from rather than in an unrelated one.
--
-- Appends only the ones the row actually holds, and only if not already
-- registered, so re-running matches nothing and existing custom entries
-- survive.
--
-- Expect: UPDATE 3
-- ═══════════════════════════════════════════════════════════════════════════

update facilities f
set    custom_service_categories = jsonb_set(
         coalesce(f.custom_service_categories, '{}'::jsonb),
         '{general}',
         coalesce(f.custom_service_categories -> 'general', '[]'::jsonb)
           || (
             select coalesce(jsonb_agg(to_jsonb(v.val)), '[]'::jsonb)
             from   unnest(array['Home visit','Travel medicine',
                                 'Medical certificate','Blood bank']) as v(val)
             where  f.services && array[v.val]
               and  not coalesce(f.custom_service_categories -> 'general', '[]'::jsonb)
                        @> to_jsonb(array[v.val])
           ),
         true
       )
where  f.services && array['Home visit','Travel medicine',
                           'Medical certificate','Blood bank'];


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — the same for pending claims, so approval does not create an orphan.
-- Expect: UPDATE 3
-- ═══════════════════════════════════════════════════════════════════════════

update facility_claims c
set    proposed_custom_service_categories = jsonb_set(
         coalesce(c.proposed_custom_service_categories, '{}'::jsonb),
         '{general}',
         coalesce(c.proposed_custom_service_categories -> 'general', '[]'::jsonb)
           || (
             select coalesce(jsonb_agg(to_jsonb(v.val)), '[]'::jsonb)
             from   unnest(array['Home visit','Travel medicine',
                                 'Medical certificate','Blood bank']) as v(val)
             where  c.proposed_services && array[v.val]
               and  not coalesce(c.proposed_custom_service_categories -> 'general', '[]'::jsonb)
                        @> to_jsonb(array[v.val])
           ),
         true
       )
where  c.proposed_services && array['Home visit','Travel medicine',
                                    'Medical certificate','Blood bank'];


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY — run after. Both must pass.
-- ═══════════════════════════════════════════════════════════════════════════

-- V1. Every retired value a facility still lists is also registered as a
--     custom entry. Expect 0 rows — any row returned is an orphan.
--
--   select f.name, s.val
--   from   facilities f, lateral unnest(f.services) s(val)
--   where  s.val in ('Home visit','Travel medicine','Medical certificate','Blood bank')
--     and  not coalesce(f.custom_service_categories -> 'general', '[]'::jsonb)
--              @> to_jsonb(array[s.val]);

-- V2. Same for claims. Expect 0 rows.
--
--   select c.proposed_name, s.val
--   from   facility_claims c, lateral unnest(c.proposed_services) s(val)
--   where  s.val in ('Home visit','Travel medicine','Medical certificate','Blood bank')
--     and  not coalesce(c.proposed_custom_service_categories -> 'general', '[]'::jsonb)
--              @> to_jsonb(array[s.val]);
-- ═══════════════════════════════════════════════════════════════════════════
