-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Read-only detection query + a guarded
-- cleanup UPDATE. Not part of the app deploy — this is a data-hygiene pass
-- for the "Dr. Dr. [Name]" display bug (see src/lib/provider/doctor-types.ts,
-- formatDoctorDisplayName / stripDoctorNamePrefix).
--
-- Specialists live inside the facilities.doctors jsonb array (each element:
-- { id, full_name, title, ... }), not a flat table, so this uses
-- jsonb_array_elements to inspect/rewrite entries in place.
--
-- Live URL that reported this bug (/specialists/dr-anteneh-tirusew-test-center-e00f96)
-- is Test Center seed data, not a real facility — this query is here in
-- case any other facility's doctors array independently picked up the same
-- issue (a provider typing "Dr." into the name field before the input-side
-- fix landed).

-- ── Step 1: detection (safe to run any time — read only) ──────────────────
select
  f.id as facility_id,
  f.slug,
  d.value ->> 'id' as doctor_id,
  d.value ->> 'full_name' as full_name,
  d.value ->> 'title' as title
from public.facilities f,
     jsonb_array_elements(f.doctors) as d
where f.doctors is not null
  and (d.value ->> 'full_name') ~* '^(dr|doctor|mr|mrs|ms|prof)\.?\s+';

-- ── Step 2: cleanup (DO NOT RUN until Step 1's output has been reviewed) ──
-- Strips a leading title-like prefix from full_name for every doctor entry
-- across every facility. Rewrites the whole `doctors` array per row via
-- jsonb_agg, applying the same regex the app now applies on save
-- (stripDoctorNamePrefix in src/lib/provider/doctor-types.ts).
--
-- update public.facilities f
-- set doctors = (
--   select jsonb_agg(
--     case
--       when (d.value ->> 'full_name') ~* '^(dr|doctor|mr|mrs|ms|prof)\.?\s+'
--         then jsonb_set(
--           d.value,
--           '{full_name}',
--           to_jsonb(trim(regexp_replace(d.value ->> 'full_name', '^(dr|doctor|mr|mrs|ms|prof)\.?\s+', '', 'i')))
--         )
--       else d.value
--     end
--   )
--   from jsonb_array_elements(f.doctors) as d
-- )
-- where f.doctors is not null
--   and exists (
--     select 1 from jsonb_array_elements(f.doctors) as d2
--     where (d2.value ->> 'full_name') ~* '^(dr|doctor|mr|mrs|ms|prof)\.?\s+'
--   );
--
-- NOTIFY pgrst, 'reload schema';
