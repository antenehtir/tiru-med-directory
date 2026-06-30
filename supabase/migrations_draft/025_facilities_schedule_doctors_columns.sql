-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- Adds schedule, doctors, emergency_type, walkin_appointment columns to facilities.
-- These fields were previously captured during provider onboarding but had no
-- matching column on the facilities table, so the approval flow skipped them.
-- After running this migration, new approvals will populate all four fields.
-- Run migration 026 next to backfill existing approved facilities (e.g. Prime Pediatric Clinic).

ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS schedule jsonb,
  ADD COLUMN IF NOT EXISTS doctors jsonb,
  ADD COLUMN IF NOT EXISTS emergency_type text,
  ADD COLUMN IF NOT EXISTS walkin_appointment text;

NOTIFY pgrst, 'reload schema';
