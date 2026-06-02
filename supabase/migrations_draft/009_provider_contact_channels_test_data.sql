-- DigitalDirectory-v2 provider contact channels test data insert draft.
-- DRAFT ONLY. DO NOT RUN UNTIL REVIEWED AND APPROVED.
-- This file is a planning artifact for the future Supabase test project.
-- It has not been executed against Supabase.
--
-- Scope:
-- - Adds fictional/sample provider contact channels only.
-- - Covers active/public contact channels for existing fictional facility and doctor providers.
-- - Covers pending, archived, hidden, and internal blocked contact channel rows.
-- - Uses only the current draft provider/channel/status vocabulary.
--
-- Out of scope for this draft:
-- - No real phone numbers.
-- - No real email addresses.
-- - No real WhatsApp links.
-- - No real websites.
-- - No real maps links.
-- - No private owner contacts.
-- - No private doctor contacts.
-- - No private staff contacts.
-- - No patient data.
-- - No booking/payment data.
-- - No admin notes.
-- - No license or verification evidence.
-- - No RLS changes.
-- - No app code changes.
--
-- Status vocabulary used:
-- listing_status: draft, pending, active, rejected, archived, suspended
-- visibility_status: public, hidden, internal
-- verification_status: unverified, pending, verified, disputed, expired

insert into public.provider_contact_channels (
  provider_type,
  provider_slug,
  channel_type,
  label,
  value_public,
  url_public,
  is_primary,
  display_order,
  listing_status,
  visibility_status,
  verification_status,
  last_confirmed_at
)
values
  (
    'facility',
    'test-facility-alpha',
    'phone',
    'Main phone',
    '+251900000001',
    null,
    true,
    10,
    'active',
    'public',
    'verified',
    '2026-01-15 09:00:00+00'
  ),
  (
    'facility',
    'test-facility-alpha',
    'whatsapp',
    'WhatsApp',
    '+251900000001',
    'https://wa.me/251900000001',
    false,
    20,
    'active',
    'public',
    'verified',
    '2026-01-15 09:00:00+00'
  ),
  (
    'facility',
    'test-facility-alpha',
    'maps',
    'Directions',
    'Example map link',
    'https://maps.example.com/test-facility-alpha',
    false,
    30,
    'active',
    'public',
    'verified',
    '2026-01-15 09:00:00+00'
  ),
  (
    'facility',
    'test-facility-eta-minimal',
    'website',
    'Website',
    'Example facility website',
    'https://example.com/test-facility-eta-minimal',
    true,
    10,
    'active',
    'public',
    'unverified',
    null
  ),
  (
    'facility',
    'test-facility-eta-minimal',
    'social',
    'LinkedIn',
    'Example LinkedIn company page',
    'https://www.linkedin.com/company/example-provider-eta',
    false,
    20,
    'active',
    'public',
    'unverified',
    null
  ),
  (
    'facility',
    'test-facility-zeta-disputed',
    'phone',
    'Public phone',
    '+251900000002',
    null,
    true,
    10,
    'active',
    'public',
    'disputed',
    '2026-01-12 09:00:00+00'
  ),
  (
    'facility',
    'test-facility-zeta-disputed',
    'maps',
    'Directions',
    'Example map link',
    'https://maps.example.com/test-facility-zeta-disputed',
    false,
    20,
    'active',
    'public',
    'disputed',
    '2026-01-12 09:00:00+00'
  ),
  (
    'doctor',
    'test-doctor-alpha',
    'social',
    'LinkedIn',
    'Example LinkedIn company page',
    'https://www.linkedin.com/company/example-provider-alpha',
    true,
    10,
    'active',
    'public',
    'verified',
    '2026-01-15 09:00:00+00'
  ),
  (
    'doctor',
    'test-doctor-alpha',
    'appointment',
    'Appointment request preview',
    'Example appointment request link',
    'https://example.com/appointment/test-doctor-alpha',
    false,
    20,
    'active',
    'public',
    'verified',
    '2026-01-15 09:00:00+00'
  ),
  (
    'doctor',
    'test-doctor-eta-minimal',
    'website',
    'Public profile website',
    'Example doctor profile',
    'https://example.com/test-doctor-eta-minimal',
    true,
    10,
    'active',
    'public',
    'unverified',
    null
  ),
  (
    'doctor',
    'test-doctor-eta-minimal',
    'phone',
    'Public profile phone',
    '+251900000003',
    null,
    false,
    20,
    'active',
    'public',
    'unverified',
    null
  ),
  (
    'doctor',
    'test-doctor-zeta-disputed',
    'social',
    'LinkedIn',
    'Example LinkedIn company page',
    'https://www.linkedin.com/company/example-provider-zeta',
    true,
    10,
    'active',
    'public',
    'disputed',
    '2026-01-12 09:00:00+00'
  ),
  (
    'doctor',
    'test-doctor-zeta-disputed',
    'whatsapp',
    'WhatsApp',
    '+251900000004',
    'https://wa.me/251900000004',
    false,
    20,
    'active',
    'public',
    'disputed',
    '2026-01-12 09:00:00+00'
  ),
  (
    'facility',
    'test-facility-beta-pending',
    'phone',
    'Pending public phone',
    '+251900000005',
    null,
    true,
    10,
    'pending',
    'hidden',
    'pending',
    null
  ),
  (
    'facility',
    'test-facility-gamma-archived',
    'website',
    'Archived website',
    'Example archived website',
    'https://example.com/test-facility-gamma-archived',
    true,
    10,
    'archived',
    'public',
    'expired',
    '2025-12-01 09:00:00+00'
  ),
  (
    'doctor',
    'test-doctor-delta-hidden',
    'social',
    'LinkedIn',
    'Example hidden LinkedIn company page',
    'https://www.linkedin.com/company/example-provider-delta-hidden',
    true,
    10,
    'active',
    'hidden',
    'verified',
    '2026-01-10 09:00:00+00'
  ),
  (
    'doctor',
    'test-doctor-epsilon-internal',
    'phone',
    'Internal public phone draft',
    '+251900000006',
    null,
    true,
    10,
    'active',
    'internal',
    'verified',
    '2026-01-11 09:00:00+00'
  );

-- Expected public read outcomes with 008_provider_contact_channels_rls_policy.sql:
-- - Active/public channels for test-facility-alpha are readable.
-- - Active/public channels for test-facility-eta-minimal are readable.
-- - Active/public channels for test-facility-zeta-disputed are readable.
-- - Active/public channels for test-doctor-alpha are readable.
-- - Active/public channels for test-doctor-eta-minimal are readable.
-- - Active/public channels for test-doctor-zeta-disputed are readable.
-- - test-facility-beta-pending channel is blocked because pending/hidden.
-- - test-facility-gamma-archived channel is blocked because archived/public.
-- - test-doctor-delta-hidden channel is blocked because active/hidden.
-- - test-doctor-epsilon-internal channel is blocked because active/internal.
--
-- All values are fictional and for draft test planning only.
-- No real contact channels are included.
-- No private owner, doctor, staff, patient, booking, payment, admin, license, or verification data is included.
-- No RLS changes are included.
