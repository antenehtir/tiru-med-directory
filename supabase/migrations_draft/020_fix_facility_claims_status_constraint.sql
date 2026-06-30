-- Run in Supabase SQL Editor (project: jsknvmfqmawamqtewcdl)
-- Drops and recreates the status check constraint to include all values the application actually uses.
-- Root cause: facility_claims was created with an older constraint that pre-dates the review wizard,
-- most likely CHECK (status IN ('pending', 'approved', 'rejected')), missing 'pending_review'.
-- Code writes: 'pending' (claim creation), 'pending_review' (provider submits),
--              'approved' (admin approves), 'rejected' (admin rejects).

ALTER TABLE facility_claims DROP CONSTRAINT IF EXISTS facility_claims_status_check;

ALTER TABLE facility_claims ADD CONSTRAINT facility_claims_status_check
  CHECK (status IN ('pending', 'pending_review', 'approved', 'rejected'));

NOTIFY pgrst, 'reload schema';
