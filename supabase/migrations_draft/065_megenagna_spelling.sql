-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- WHY: the neighbourhood is spelt "Megenagna" in most listings and
-- "Megenagha" in five. The public area search now tolerates a one-letter
-- slip, so both are found either way — this makes the listings themselves
-- read correctly and consistently.
--
-- Measured 2026-09-19, immediately before drafting:
--   facilities.area      3 rows  (LA VISTA Specialty Eye Clinic,
--                                 Dr. Mihretu Dermatology Clinic,
--                                 Betsegah Maternal and Children Hospital)
--   facilities.branches  2 rows  (Wudassie Diagnostic Center,
--                                 Pioneer Diagnostic Center)
--   facility_claims      0 rows
--
-- Replaces the word wherever it appears, in any capitalisation, with
-- "Megenagna"; nothing else in those texts changes. Branches are JSON, so
-- they are edited as text and cast back — only the spelling inside changes.

-- BEFORE — read-only, run first and note the numbers (expect 3 and 2):
--
--   select
--     count(*) filter (where area ~* 'megenagha')            as in_area,
--     count(*) filter (where branches::text ~* 'megenagha')  as in_branches
--   from public.facilities;

update public.facilities
set area = regexp_replace(area, 'megenagha', 'Megenagna', 'gi')
where area ~* 'megenagha';

update public.facilities
set branches = regexp_replace(branches::text, 'megenagha', 'Megenagna', 'gi')::jsonb
where branches::text ~* 'megenagha';

-- AFTER — read-only. Expect 0 and 0:
--
--   select
--     count(*) filter (where area ~* 'megenagha')            as in_area,
--     count(*) filter (where branches::text ~* 'megenagha')  as in_branches
--   from public.facilities;
