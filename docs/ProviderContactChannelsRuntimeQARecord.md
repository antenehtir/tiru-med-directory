# DigitalDirectory-v2 Provider Contact Channels Runtime QA Record

## Purpose

This document records the confirmed manual runtime QA result for the provider contact channels public read helper.

This is a documentation-only QA record. It does not modify app code, frontend UI, SQL, RLS policies, test data, facility detail pages, doctor detail pages, authentication, backend functionality, protected routes, environment values, keys, or service-role usage.

## Probe Route

Manual QA was performed with the internal runtime probe route:

```text
/internal/provider-contact-channels-probe
```

The probe route calls:

```text
getSupabasePublicProviderContactChannels(providerType, providerSlug)
```

It displays only safe runtime information:

- Provider type
- Provider slug
- Result status
- Safe category
- Public channel count
- Channel type
- Label
- Public display value or public URL

## Public Provider Results

Confirmed public provider runtime results:

| Provider type | Provider slug | Result | Public channel count |
| --- | --- | --- | --- |
| `facility` | `test-facility-alpha` | `success` | 3 |
| `facility` | `test-facility-eta-minimal` | `success` | 2 |
| `facility` | `test-facility-zeta-disputed` | `success` | 2 |
| `doctor` | `test-doctor-alpha` | `success` | 2 |
| `doctor` | `test-doctor-eta-minimal` | `success` | 2 |
| `doctor` | `test-doctor-zeta-disputed` | `success` | 2 |

The public provider rows returned only active/public contact channels.

## Blocked Provider Cases

Confirmed blocked provider runtime results:

| Provider type | Provider slug | Result | Public channel count |
| --- | --- | --- | --- |
| `facility` | `test-facility-beta-pending` | `success-empty` | 0 |
| `facility` | `test-facility-gamma-archived` | `success-empty` | 0 |
| `doctor` | `test-doctor-delta-hidden` | `success-empty` | 0 |
| `doctor` | `test-doctor-epsilon-internal` | `success-empty` | 0 |

Blocked hidden, internal, pending, and archived contact rows did not appear in the runtime probe results.

## Unknown Provider Cases

Confirmed unknown provider runtime results:

| Provider type | Provider slug | Result | Public channel count |
| --- | --- | --- | --- |
| `facility` | `non-existent-facility-slug` | `success-empty` | 0 |
| `doctor` | `non-existent-doctor-slug` | `success-empty` | 0 |

Unknown provider slugs returned safe empty results and did not expose errors.

## Channel Types Observed

Confirmed public channel types observed:

- `phone`
- `whatsapp`
- `website`
- `maps`
- `social` with label `LinkedIn`
- `appointment`

LinkedIn remains represented as:

```text
channel_type = social
label = LinkedIn
```

This matches the current provider contact channel SQL constraint without needing a separate `linkedin` channel type.

## Safety Confirmation

The runtime QA confirmed:

- No raw Supabase errors were visible.
- No environment values were visible.
- No keys were visible.
- No service-role key was used.
- No private owner contacts were used.
- No private doctor contacts were used.
- No private staff contacts were used.
- No patient data was used.
- No booking data was used.
- No payment data was used.
- No admin data was used.
- No license data was used.
- Facility detail pages are not wired to provider contact channels yet.
- Doctor detail pages are not wired to provider contact channels yet.

## Current Limitations

The provider contact channels public read helper is runtime-tested through the internal probe route only.

Remaining limitations:

- Facility detail pages do not yet compose contact channels from Supabase.
- Doctor detail pages do not yet compose contact channels from Supabase.
- Public UI has not been changed to display provider contact channels.
- Pharmacy, diagnostics, telemedicine, ambulance, and home care contact channel reads remain future work.
- Provider contact channel editing, review, ownership, audit logs, and protected workflows remain out of scope.

## Recommended Next Task

Recommended next task:

```text
Wire provider contact channels into facility and doctor detail pages
```

That task should keep the read path public-safe, use the existing helper, avoid raw Supabase errors, preserve the current detail page design as much as possible, and continue to exclude hidden, internal, pending, archived, rejected, or suspended contact channel rows.

## Summary

Provider contact channels runtime QA passed manually through `/internal/provider-contact-channels-probe`.

Public facility and doctor providers returned successful active/public contact channels, blocked provider cases returned safe empty results, unknown providers returned safe empty results, observed channel types matched the planned schema, and no raw errors, keys, service-role usage, private contacts, patient data, booking data, payment data, admin data, or license data were exposed.
