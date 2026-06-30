-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- Adds active/inactive lifecycle columns to the facilities table.
-- Safe: all columns use IF NOT EXISTS guards and safe defaults.
-- DO NOT run against the live DB — leave for manual execution.
--
-- After running this migration, the public-facing queries that include
-- .eq('is_active', true) will take effect and inactive facilities will
-- be hidden from the public directory, search, and nearby results.
-- Before this migration is applied those queries fall back to static data
-- (the original 105 facilities) — no data loss, just an acceptable interim state.

ALTER TABLE facilities
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS deactivation_reason text,
  ADD COLUMN IF NOT EXISTS deactivation_category text,
  ADD COLUMN IF NOT EXISTS deactivated_at timestamptz,
  ADD COLUMN IF NOT EXISTS deactivated_by uuid REFERENCES admin_users(id),
  ADD COLUMN IF NOT EXISTS reactivated_at timestamptz;

-- Backfill: mark all existing rows as active (DEFAULT true handles new rows).
UPDATE facilities SET is_active = true WHERE is_active IS NULL;

NOTIFY pgrst, 'reload schema';
