-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- DRAFT — DO NOT RUN UNTIL REVIEWED. Leave for manual execution.
--
-- Extends the facility "entrance photo" from a single image to a gallery of
-- up to 4 images.
--
-- Both facilities.photo_url and facility_claims.proposed_entrance_photo_url
-- are single `text` columns today. The app code (as of this change) writes
-- to the new *_photo_urls array columns added below and keeps the legacy
-- singular columns in sync as photo_urls[0], so nothing reading the old
-- columns needs to change. Until this migration is run, the app tolerates
-- the new columns being absent (see src/lib/provider/facility-field-mapping.ts
-- and src/app/provider/(console)/onboarding/media/actions.ts) — the *_urls
-- fields are simply dropped from any INSERT/UPDATE payload rather than
-- erroring, and reads fall back to wrapping the legacy single URL in a
-- 1-element array.

alter table public.facilities
  add column if not exists photo_urls jsonb not null default '[]'::jsonb;

alter table public.facility_claims
  add column if not exists proposed_entrance_photo_urls jsonb not null default '[]'::jsonb;

-- Backfill: wrap any existing single-URL value into a 1-element array,
-- but only where the array column hasn't already been populated.
update public.facilities
set photo_urls = jsonb_build_array(photo_url)
where photo_url is not null
  and (photo_urls is null or photo_urls = '[]'::jsonb);

update public.facility_claims
set proposed_entrance_photo_urls = jsonb_build_array(proposed_entrance_photo_url)
where proposed_entrance_photo_url is not null
  and (proposed_entrance_photo_urls is null or proposed_entrance_photo_urls = '[]'::jsonb);

NOTIFY pgrst, 'reload schema';
