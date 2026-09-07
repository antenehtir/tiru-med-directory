-- 048 — normalise free-typed specialty names onto the checklist
-- ═══════════════════════════════════════════════════════════════════════════
-- APPLIED 2026-09-07. Confirmed by querying the live database afterwards, not
-- by the presence of this file: 0 rows anywhere still hold an old spelling,
-- Lancet holds all 14 normalised names across 105 services with an empty
-- custom bucket, Danu is at 7 with an empty bucket, Heal Venture is untouched
-- at 10, and Smile still holds its 6 dental procedures under "general".
-- All 8 facility_claims are clean, so no pending claim can reintroduce one.
--
-- Fourteen specialties in the live directory exist only as free text, because
-- the onboarding checklist did not offer them. Thirteen were typed by Lancet
-- General Hospital, one by Danu Orthopaedic Center. They are now catalogue
-- entries in SPECIALTIES (onboarding-config.ts), and this migration moves the
-- existing rows onto those entries.
--
-- Without it the additions make things WORSE, not better: a free-typed value
-- is stored twice — once in `services` and once in `custom_service_categories`
-- so the editor can render it as a removable chip — so Lancet's services page
-- would show "Plastic & Reconstructive Surgery" as a chip AND
-- "Plastic and Reconstructive Surgery" as an unticked pill, which is the
-- duplication the upper/lower service sections were merged to stop.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- WHAT CHANGES, AND WHY EACH
--
--   Infectious Disease                     -> Infectious Diseases
--   Maxillofacial                          -> Maxillofacial Surgery
--   Plastic & Reconstructive Surgery       -> Plastic and Reconstructive Surgery
--   Hepatobiliary surgery                  -> Hepatobiliary Surgery
--   Colorectal surgery                     -> Colorectal Surgery
--   Cardiothoracic surgery                 -> Cardiothoracic Surgery
--   Endocrine and brest surgery            -> Endocrine and Breast Surgery   (typo)
--   Orthopedica Surgery                    -> Orthopedic Surgery             (typo)
--
-- Three were compound — one field name covering two specialties. The parent
-- half is ALREADY ticked on every row that holds them (verified against live
-- data: Lancet lists Pulmonology, Gastroenterology and Orthopedics as
-- catalogue values), so only the half the checklist was missing is added:
--
--   Pulmonology and critical care medicine -> Critical Care Medicine
--   Gastroenterology and Hepatology        -> Hepatology
--   Orthopedic and Trauma surgery          -> Orthopedic Surgery + Trauma Surgery
--
-- Three were already spelled exactly right and only need to stop being custom:
-- Anesthesiology, Vascular Surgery, Pediatric Surgery. These appear as
-- identity rows below (old = new) so STEP 1 leaves them alone and STEP 2 still
-- knows to stop treating them as free text.
--
-- Matched on the VALUE, never on a slug or id, so a second facility that typed
-- the same thing is corrected too and re-running is harmless.
--
-- ═══════════════════════════════════════════════════════════════════════════
-- ROWS AFFECTED, measured against live data immediately before writing this
--
--   Lancet General Hospital   services 104 -> 105   custom {specialty:[13]} -> {}
--   Danu Orthopaedic Center   services   7 ->   7   custom {general:[1]}    -> {}
--   Heal Venture Med & Surg   services  10 ->  10   custom {} (UNCHANGED — its
--                                                    "Pediatric Surgery" is an
--                                                    identity row and was never
--                                                    stored as custom)
--
-- Only Lancet gains a service, and only because of the Orthopedic-and-Trauma
-- split. Nothing else in the directory holds any of these strings.
--
-- The two steps are independent statements with no temp table and no explicit
-- transaction, so each can be pasted into the Supabase SQL editor on its own
-- and checked before the next is run.
-- ═══════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 0 — DRY RUN. Changes nothing. Run this first.
--
-- Same CTEs as STEP 1, ending in a SELECT instead of an UPDATE, so it shows
-- exactly which rows would change and what would be added or removed from
-- each. If this returns anything other than the two expected rows, stop.
--
-- Expect exactly 2 rows:
--   Lancet General Hospital   104 -> 105   added: 13 normalised names
--                                          removed: the 11 old spellings
--   Danu Orthopaedic Center     7 ->   7   added: Orthopedic Surgery
--                                          removed: Orthopedica Surgery
-- ═══════════════════════════════════════════════════════════════════════════

with renames(old_value, new_value) as (
  values
    ('Infectious Disease',                     'Infectious Diseases'),
    ('Maxillofacial',                          'Maxillofacial Surgery'),
    ('Plastic & Reconstructive Surgery',       'Plastic and Reconstructive Surgery'),
    ('Hepatobiliary surgery',                  'Hepatobiliary Surgery'),
    ('Colorectal surgery',                     'Colorectal Surgery'),
    ('Cardiothoracic surgery',                 'Cardiothoracic Surgery'),
    ('Endocrine and brest surgery',            'Endocrine and Breast Surgery'),
    ('Orthopedica Surgery',                    'Orthopedic Surgery'),
    ('Pulmonology and critical care medicine', 'Critical Care Medicine'),
    ('Gastroenterology and Hepatology',        'Hepatology'),
    ('Orthopedic and Trauma surgery',          'Orthopedic Surgery'),
    ('Orthopedic and Trauma surgery',          'Trauma Surgery'),
    ('Anesthesiology',                         'Anesthesiology'),
    ('Vascular Surgery',                       'Vascular Surgery'),
    ('Pediatric Surgery',                      'Pediatric Surgery')
),
expanded as (
  select f.id, s.ord, coalesce(r.new_value, s.val) as val
  from facilities f
  cross join lateral unnest(f.services) with ordinality as s(val, ord)
  left join renames r on r.old_value = s.val
),
deduped as (
  select id, val, min(ord) as ord from expanded group by id, val
),
rebuilt as (
  select id, array_agg(val order by ord, val) as new_services from deduped group by id
)
select f.name,
       cardinality(f.services)            as before_count,
       cardinality(rebuilt.new_services)  as after_count,
       array(select unnest(rebuilt.new_services) except select unnest(f.services)) as would_add,
       array(select unnest(f.services) except select unnest(rebuilt.new_services)) as would_remove
from facilities f
join rebuilt on rebuilt.id = f.id
where f.services is distinct from rebuilt.new_services
order by f.name;


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 1 — rewrite `services`
--
-- Order is preserved (each value keeps its earliest original position) and
-- duplicates collapse, so a row that already held "Orthopedic Surgery" does
-- not end up with it twice after the split. Idempotent: once rewritten, no
-- old_value remains to match, and the final `is distinct from` guard means a
-- second run updates zero rows.
-- ═══════════════════════════════════════════════════════════════════════════

with renames(old_value, new_value) as (
  values
    ('Infectious Disease',                     'Infectious Diseases'),
    ('Maxillofacial',                          'Maxillofacial Surgery'),
    ('Plastic & Reconstructive Surgery',       'Plastic and Reconstructive Surgery'),
    ('Hepatobiliary surgery',                  'Hepatobiliary Surgery'),
    ('Colorectal surgery',                     'Colorectal Surgery'),
    ('Cardiothoracic surgery',                 'Cardiothoracic Surgery'),
    ('Endocrine and brest surgery',            'Endocrine and Breast Surgery'),
    ('Orthopedica Surgery',                    'Orthopedic Surgery'),
    ('Pulmonology and critical care medicine', 'Critical Care Medicine'),
    ('Gastroenterology and Hepatology',        'Hepatology'),
    -- Two rows for one old value is how the 1-to-2 split is expressed; the
    -- join below emits both, and the dedupe keeps them distinct.
    ('Orthopedic and Trauma surgery',          'Orthopedic Surgery'),
    ('Orthopedic and Trauma surgery',          'Trauma Surgery'),
    -- Identity rows: spelling already correct.
    ('Anesthesiology',                         'Anesthesiology'),
    ('Vascular Surgery',                       'Vascular Surgery'),
    ('Pediatric Surgery',                      'Pediatric Surgery')
),
expanded as (
  select f.id,
         s.ord,
         coalesce(r.new_value, s.val) as val
  from facilities f
  cross join lateral unnest(f.services) with ordinality as s(val, ord)
  left join renames r on r.old_value = s.val
),
deduped as (
  select id, val, min(ord) as ord
  from expanded
  group by id, val
),
rebuilt as (
  select id, array_agg(val order by ord, val) as new_services
  from deduped
  group by id
)
update facilities f
set services = rebuilt.new_services
from rebuilt
where rebuilt.id = f.id
  and f.services is distinct from rebuilt.new_services;

-- Result: UPDATE 2   (Lancet and Danu. Heal Venture was untouched, as predicted.)


-- ═══════════════════════════════════════════════════════════════════════════
-- STEP 2 — drop the same values out of custom_service_categories
--
-- A bucket left empty is removed rather than kept as [], because the editor
-- treats a present key as "this facility has custom entries here". Smile
-- Specialty Dental Center's six dental procedures share the "general" bucket
-- shape with Danu but none of these values, so its bucket survives intact.
-- Idempotent: the WHERE clause matches nothing on a second run.
-- ═══════════════════════════════════════════════════════════════════════════

with removed(old_value) as (
  values
    ('Infectious Disease'),
    ('Maxillofacial'),
    ('Plastic & Reconstructive Surgery'),
    ('Hepatobiliary surgery'),
    ('Colorectal surgery'),
    ('Cardiothoracic surgery'),
    ('Endocrine and brest surgery'),
    ('Orthopedica Surgery'),
    ('Pulmonology and critical care medicine'),
    ('Gastroenterology and Hepatology'),
    ('Orthopedic and Trauma surgery'),
    ('Anesthesiology'),
    ('Vascular Surgery'),
    ('Pediatric Surgery')
)
update facilities f
set custom_service_categories = coalesce(
  (
    select jsonb_object_agg(b.key, b.kept)
    from (
      select e.key,
             coalesce(
               (
                 select jsonb_agg(v.val order by v.ord)
                 from jsonb_array_elements_text(e.value) with ordinality as v(val, ord)
                 where v.val not in (select old_value from removed)
               ),
               '[]'::jsonb
             ) as kept
      from jsonb_each(f.custom_service_categories) as e
    ) b
    where jsonb_array_length(b.kept) > 0
  ),
  '{}'::jsonb
)
where f.custom_service_categories is not null
  and exists (
    select 1
    from jsonb_each(f.custom_service_categories) as e
    cross join lateral jsonb_array_elements_text(e.value) as v(val)
    where v.val in (select old_value from removed)
  );

-- Result: UPDATE 2   (Lancet and Danu.)


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY — run these after, separately. All four must pass.
-- ═══════════════════════════════════════════════════════════════════════════

-- V1. No free-typed value anywhere still matches a renamed entry. Expect 0 rows.
--
--   select f.name, v.val
--   from facilities f,
--        lateral jsonb_each(coalesce(f.custom_service_categories, '{}'::jsonb)) e,
--        lateral jsonb_array_elements_text(e.value) v(val)
--   where v.val in (
--     'Infectious Disease','Maxillofacial','Plastic & Reconstructive Surgery',
--     'Hepatobiliary surgery','Colorectal surgery','Cardiothoracic surgery',
--     'Endocrine and brest surgery','Orthopedica Surgery',
--     'Pulmonology and critical care medicine','Gastroenterology and Hepatology',
--     'Orthopedic and Trauma surgery','Anesthesiology','Vascular Surgery',
--     'Pediatric Surgery'
--   );

-- V2. No OLD spelling survives in services either. Expect 0 rows.
--
--   select name, s.val
--   from facilities f, lateral unnest(f.services) s(val)
--   where s.val in (
--     'Infectious Disease','Maxillofacial','Plastic & Reconstructive Surgery',
--     'Hepatobiliary surgery','Colorectal surgery','Cardiothoracic surgery',
--     'Endocrine and brest surgery','Orthopedica Surgery',
--     'Pulmonology and critical care medicine','Gastroenterology and Hepatology',
--     'Orthopedic and Trauma surgery'
--   );

-- V3. Lancet carries the normalised names. Expect all 13 present, including
--     Critical Care Medicine, Hepatology, Orthopedic Surgery, Trauma Surgery.
--
--   select s.val
--   from facilities f, lateral unnest(f.services) s(val)
--   where f.slug = 'lancet-general-hospital'
--     and s.val in (
--       'Infectious Diseases','Maxillofacial Surgery',
--       'Plastic and Reconstructive Surgery','Pediatric Surgery',
--       'Hepatobiliary Surgery','Colorectal Surgery','Cardiothoracic Surgery',
--       'Endocrine and Breast Surgery','Critical Care Medicine','Hepatology',
--       'Orthopedic Surgery','Trauma Surgery','Anesthesiology','Vascular Surgery'
--     )
--   order by s.val;

-- V4. Counts and buckets. Expect exactly:
--     lancet   105 services, custom {}
--     danu       7 services, custom {}
--     heal      10 services, custom {}
--     smile     10 services, custom still holding its 6 "general" entries
--
--   select slug, cardinality(services) as service_count, custom_service_categories
--   from facilities
--   where slug in ('lancet-general-hospital','danu-orthopaedic-center',
--                  'heal-venture-medical-and-surgical-center',
--                  'smile-specialty-dental-center')
--   order by slug;
