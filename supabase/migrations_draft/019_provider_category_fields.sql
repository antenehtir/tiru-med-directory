-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- Safe: all use IF NOT EXISTS guards

ALTER TABLE provider_accounts
  ADD COLUMN IF NOT EXISTS facility_type text,
  ADD COLUMN IF NOT EXISTS facility_type_other text,
  ADD COLUMN IF NOT EXISTS diagnostic_subtype text;

ALTER TABLE facility_claims
  ADD COLUMN IF NOT EXISTS facility_type text,
  ADD COLUMN IF NOT EXISTS diagnostic_subtype text,
  ADD COLUMN IF NOT EXISTS proposed_category_data jsonb;

NOTIFY pgrst, 'reload schema';
