ALTER TABLE facility_claims
  ADD COLUMN IF NOT EXISTS proposed_license_issue_date date,
  ADD COLUMN IF NOT EXISTS proposed_license_expiry_date date,
  ADD COLUMN IF NOT EXISTS proposed_business_license_url text,
  ADD COLUMN IF NOT EXISTS proposed_business_license_issue_date date,
  ADD COLUMN IF NOT EXISTS proposed_business_license_expiry_date date;

GRANT UPDATE ON public.facility_claims TO authenticated;
NOTIFY pgrst, 'reload schema';
