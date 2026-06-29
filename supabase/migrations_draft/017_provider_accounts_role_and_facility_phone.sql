-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- Safe to run: uses IF NOT EXISTS guards
ALTER TABLE provider_accounts
  ADD COLUMN IF NOT EXISTS claimant_role text,
  ADD COLUMN IF NOT EXISTS facility_phone text;

NOTIFY pgrst, 'reload schema';
