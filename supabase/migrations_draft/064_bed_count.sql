-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- WHY: a facility that admits patients ("Inpatient admission" in its
-- services) can now say how many beds it has. Asked in the onboarding
-- wizard as soon as that service is ticked, and editable in the facility
-- editor for listings that are already live — admin-added, claimed, or
-- provider-managed. Shown on the public facility page.
--
-- Adds one nullable column to each table. NULL means "not stated"; no
-- existing row is changed. The check keeps the number sensible (1–5000).

alter table public.facilities
  add column if not exists bed_count integer;
alter table public.facilities
  drop constraint if exists facilities_bed_count_range;
alter table public.facilities
  add constraint facilities_bed_count_range check (bed_count is null or bed_count between 1 and 5000);

alter table public.facility_claims
  add column if not exists proposed_bed_count integer;
alter table public.facility_claims
  drop constraint if exists facility_claims_bed_count_range;
alter table public.facility_claims
  add constraint facility_claims_bed_count_range check (proposed_bed_count is null or proposed_bed_count between 1 and 5000);

NOTIFY pgrst, 'reload schema';

-- AFTER RUNNING — read-only check. Expect two rows, both integer and
-- nullable:
--
--   select table_name, column_name, data_type, is_nullable
--   from information_schema.columns
--   where column_name in ('bed_count', 'proposed_bed_count')
--   order by table_name;
