-- MANUAL: run against the live Supabase project (SQL Editor) if not already
-- present — submitForReview() writes this column when a provider submits
-- their listing for review.
ALTER TABLE facility_claims
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

NOTIFY pgrst, 'reload schema';
