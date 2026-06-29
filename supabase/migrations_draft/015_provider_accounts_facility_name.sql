-- MANUAL: run against the live Supabase project (SQL Editor) before
-- /provider/signup will be able to persist the new "Facility name" field.
ALTER TABLE provider_accounts
  ADD COLUMN IF NOT EXISTS facility_name text;

NOTIFY pgrst, 'reload schema';
