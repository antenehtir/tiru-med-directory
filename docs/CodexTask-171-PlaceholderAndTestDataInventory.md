# Codex Task 171: Placeholder and Test Data Inventory

## Project

DigitalDirectory-v2

## Goal

Inventory placeholder, test, demo, fictional, static fallback, mock, seed, preview-only, and empty-state content currently present in the project.

This is an inventory-only documentation task. No source code, test data, Supabase SQL, RLS, schema, migrations, real data, static data, UI, brand, logo, colors, routes, probe scripts, or package scripts were modified for this task.

---

## Context Reviewed

Planning and checkpoint references:

- `docs/CodexTask-169-PostDiagnosticsMVPCheckpoint.md`
- `docs/CodexTask-170-PlaceholderAndTestDataCleanupPlanning.md`

Inventory areas inspected:

- `src/data`
- `src/app`
- `src/components`
- `src/lib/public-listing-mappers.ts`
- `src/lib/supabase`
- `docs`
- `scripts`
- `package.json`

Search terms used:

```text
test
demo
sample
fictional
placeholder
preview
coming soon
not listed yet
fallback
static
mock
seed
TODO
FIXME
dummy
example
```

No meaningful source-code `TODO` or `FIXME` cleanup markers were found in the inspected source areas. Matches for those terms were primarily in this task document or historical docs.

---

## Inventory Status

```text
Inventory complete.
```

This inventory is intentionally classification-only. It does not clean, delete, replace, hide, or modify any source or data.

---

## Known Diagnostics Test Slugs

These diagnostics test slugs are known QA fixtures from the manually verified diagnostics SQL setup.

| Area/File | Term or content found | Type | Public visibility risk | Recommended classification | Recommended later action | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Supabase test data / `scripts/probe-diagnostics.ts` | `test-diagnostic-alpha-lab` | Test data / public positive fixture | Medium | Keep for QA | Keep for QA until real diagnostics data replacement is ready | Manually verified active/public row; used by diagnostics listing probe expectations. |
| Supabase test data / `scripts/probe-diagnostics.ts` | `test-diagnostic-eta-imaging` | Test data / public positive fixture | Medium | Keep for QA | Keep for QA until real diagnostics data replacement is ready | Manually verified active/public row; used by diagnostics listing probe expectations. |
| Supabase test data / `scripts/probe-diagnostics.ts` | `test-diagnostic-zeta-radiology` | Test data / public positive fixture | Medium | Keep for QA | Keep for QA until real diagnostics data replacement is ready | Manually verified active/public row; used by diagnostics listing probe expectations. |
| Supabase test data / `scripts/probe-diagnostics.ts` | `test-diagnostic-omega-pathology` | Test data / public positive fixture | Medium | Keep for QA | Keep for QA until real diagnostics data replacement is ready | Manually verified active/public row; used by diagnostics listing probe expectations. |
| Supabase test data / `scripts/probe-diagnostics.ts` | `test-diagnostic-kappa-mixed` | Test data / public positive fixture | Medium | Keep for QA | Keep for QA until real diagnostics data replacement is ready | Manually verified active/public row; used by diagnostics listing probe expectations. |
| Supabase test data / `scripts/probe-diagnostics.ts` | `test-diagnostic-lambda-home-sample` | Test data / public positive fixture | Medium | Keep for QA | Keep for QA until real diagnostics data replacement is ready | Manually verified active/public row; used by diagnostics listing probe expectations. |
| Supabase test data / `scripts/probe-diagnostics.ts` and `scripts/probe-diagnostics-detail.ts` | `test-diagnostic-beta-pending` | Test data / blocked fixture | Low | Keep for QA | Keep for QA until replacement blocked-row QA data exists | Manually verified excluded from active/public SQL result; used for negative probe checks. |
| Supabase test data / `scripts/probe-diagnostics.ts` and `scripts/probe-diagnostics-detail.ts` | `test-diagnostic-delta-hidden` | Test data / blocked fixture | Low | Keep for QA | Keep for QA until replacement blocked-row QA data exists | Manually verified excluded from active/public SQL result; used for negative probe checks. |

---

## Findings Table

| Area/File | Term or content found | Type | Public visibility risk | Recommended classification | Recommended later action | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `src/data/seed-facilities.ts` | `sourceType: "sample"`, `published-sample`, `sample-only`, sample verification note | Seed / sample provider data | High | Replace with real data | Inventory exact provider rows, then replace with real verified facility records or remove after real data import | Feeds `sampleFacilities`, homepage cards, facility listing, facility detail fallback, nearby preview, and search results. |
| `src/data/seed-facilities.ts` | `Addis Health Center`, `Unity Medical Clinic`, `Sunrise Diagnostic Lab`, `Kazanchis Community Clinic` | Fictional or unverified provider-like data | High | Replace with real data | Confirm whether any names are real and approved; otherwise replace or remove after real data import | These names look plausible and can appear public. |
| `src/data/seed-doctors.ts` | `Dr. Hana Bekele`, `Dr. Samuel Tesfaye`, `Dr. Meron Dawit` | Fictional or unverified provider-like data | High | Replace with real data | Replace with verified doctor records or hide from public UI until real data is available | Doctor names look like real people and are used by listing/detail pages. |
| `src/data/seed-pharmacies.ts` | `Bole Community Pharmacy`, `Central Care Pharmacy`, `Kazanchis Health Pharmacy` | Fictional or unverified provider-like data | High | Replace with real data | Replace with verified pharmacy records or remove after real data import | Pharmacy module is MVP-stable, so these fallback records are likely visible if Supabase is unavailable. |
| `src/data/seed-diagnostics.ts` | `Sunrise Diagnostic Lab`, `Bole Imaging Center`, `Central Screening Lab` | Fictional or unverified provider-like data | High | Replace with real data | Replace with verified diagnostics provider records after runtime live-row verification is stable | These static fallback diagnostics are returned when diagnostics Supabase read fails. |
| `src/data/seed-diagnostics.ts` | `Radiology and imaging preview`, `Ultrasound preview`, `Screening preview`, `Contact preview`, `Location preview` | Preview-only provider copy | Medium | Replace with real data | Replace public-facing preview labels with real public services/actions when data is ready | Visible through diagnostics fallback cards/details. |
| `src/data/seed-pharmacies.ts` | `Medicine access preview`, `Refill preview`, `Pickup preview`, `Contact preview`, `Location preview` | Preview-only pharmacy copy | Medium | Replace with real data | Replace with real public pharmacy service labels and approved contact states | Visible through pharmacy static fallback. |
| `src/data/seed-doctors.ts` | `Next sample slot today`, `Limited sample availability`, `Booking preview` | Preview-only doctor availability/booking copy | Medium | Replace with real data | Replace with real availability summaries or hide booking/action labels until workflow is real | Could imply scheduling readiness. |
| `src/data/seed-community-channels.ts` | `Placeholder Telegram`, `Placeholder LinkedIn`, `Placeholder Facebook`, `Placeholder Instagram`, `Placeholder TikTok`, `Placeholder email`, `Placeholder WhatsApp` | Placeholder channel data | Medium | Needs product decision | Decide whether public community/social channels should be hidden, replaced with official links, or retained as clearly disabled | Placeholder public channel links can confuse users if shown as official. |
| `src/data/seed-services.ts` | `General care preview`, `Frontend-only preview`, `Sample preventive care`, `Ultrasound preview`, `Static imaging service label` | Seed service taxonomy / preview labels | Medium | Replace with real data | Replace with approved service taxonomy and remove preview language from public labels | Used by provider cards and filters. |
| `src/data/seed-specialties.ts` | `reviewStatus: "sample-only"` | Seed specialty taxonomy | Medium | Replace with real data | Confirm specialty labels, then remove sample-only status when real taxonomy is approved | Public specialty labels may be acceptable, but sample-only trust status should be reviewed. |
| `src/data/seed-types.ts` | `SeedSourceType`, `published-sample`, `draft-sample`, `hidden-sample`, `sample-only` | Seed metadata model | Low | Keep for QA | Retain until real-data source model replaces sample metadata | Useful for classifying seed state; not directly user-facing. |
| `src/app/facilities/page.tsx` | imports `sampleFacilities`; `supabase-facilities-preview`; `Hours not listed`, `Availability not listed` | Static fallback and preview-mode route behavior | High | Needs product decision | Decide whether `/facilities` should use live data, fallback cards, or hide sample cards before MVP review | Public route can show sample data and preview-mode behavior. |
| `src/app/doctors/page.tsx` | imports `sampleDoctors`; fallback returns sample doctors; `Availability not listed` | Static fallback route behavior | High | Replace with real data | Replace sample doctor fallback with real verified doctor data or hide if not ready | Public route. |
| `src/app/pharmacies/page.tsx` | imports `samplePharmacies`; fallback returns sample pharmacies; `Hours not listed`, `Availability not listed` | Static fallback route behavior | High | Replace with real data | Replace fallback pharmacy records with real verified pharmacy data or retain only after owner approval | Public route. |
| `src/app/diagnostics/page.tsx` | imports `sampleDiagnostics`; fallback returns sample diagnostics; `Hours not listed`, `Availability not listed` | Static fallback route behavior | High | Replace with real data | Replace fallback diagnostics with real verified diagnostics data after live runtime verification is stable | Public route and current diagnostics probe limitation make this a visible risk. |
| `src/app/facilities/addis-health-center/page.tsx` | static route for sample detail | Static sample detail route | High | Remove after real data import | Replace with dynamic verified detail route or remove static sample route once real data is ready | Direct URL can expose sample facility detail. |
| `src/app/doctors/dr-hana-bekele/page.tsx` | static route for sample doctor detail | Static sample detail route | High | Remove after real data import | Replace with verified dynamic route behavior or remove static sample route once real data is ready | Direct URL can expose sample doctor detail. |
| `src/app/*-preview/page.tsx` | `account-preview`, `admin-review-preview`, `booking-request-preview`, `patient-account-preview`, `provider-dashboard-preview` | Preview-only public routes | Medium | Hide from public UI | Decide whether to keep accessible for internal demos, remove public navigation, or gate from MVP users | Routes are public unless hidden or gated. |
| `src/app/internal/*` | test probe routes with `test-facility-*`, `test-doctor-*`, fallback timeout logic | Internal probe fixtures | Internal only | Keep for QA | Keep internal-only; verify not linked from public navigation for MVP review | Useful for QA but should not be treated as public content. |
| `src/components/home/*` | `Sample facility cards`, `Sample verified result`, `View sample facilities`, `sample specialist profiles`, `Location-based sample listings`, `preview nearby healthcare` | Public homepage sample/preview copy | High | Replace with real data | Replace homepage wording with production-safe discovery copy once real data plan is approved | High visibility on first page. |
| `src/components/search-results/*` | `frontend-only`, `mock data`, `sample results`, `No mock providers matched` | Public search preview/mock copy | High | Replace with real data | Replace with real search/result wording or hide search results until data is ready | Search is a core public journey. |
| `src/components/facilities/*` | `Facilities directory preview`, `Explore sample clinics`, `Preview only. No real search`, `Sample facility cards` | Public facility preview copy | High | Replace with real data | Remove preview-only wording after real listing behavior is confirmed | Public provider category page. |
| `src/components/doctors/*` | `Doctors directory preview`, `Browse sample doctor profiles`, `Preview only. No real doctor search`, `Availability is shown as sample schedule text` | Public doctor preview copy | High | Replace with real data | Replace with real doctor directory wording or hide unsupported workflow claims | Public provider category page. |
| `src/components/pharmacies/*` | `Pharmacy discovery preview`, delivery/pickup/prescription preview components | Public pharmacy preview copy | Medium | Needs product decision | Decide which pharmacy workflow previews remain informational and which should be hidden until real contact/workflow data exists | Pharmacy module is MVP-stable but workflow language may imply unavailable functionality. |
| `src/components/diagnostics/*` | diagnostics hero/search/service preview components and sample collection preview wording | Public diagnostics preview copy | Medium | Needs product decision | Replace preview labels with real discovery copy after diagnostics data replacement plan | Diagnostics module is MVP-stable but live runtime probe limitation remains. |
| `src/components/facility-detail/*` | `Contact previews`, `future actions only`, `Save preview`, `Sample facilities use...`, sample facility data note | Public detail preview copy | High | Needs product decision | Decide whether detail action panels should remain preview-only or be rewritten as non-clickable contact information | Used by facility, pharmacy, and diagnostics detail layout. |
| `src/components/doctor-detail/*` | `Patient action previews`, `Contact preview`, `Save doctor preview`, `sample doctor data only`, telemedicine preview | Public doctor detail preview copy | High | Needs product decision | Replace with real-safe action panel wording or hide inactive actions before MVP review | Directly visible on doctor detail. |
| `src/components/nearby/*` | `Nearby healthcare preview`, `Preview area`, `Static chips`, `Sample collection availability preview only`, `No geolocation` | Public nearby preview feature | Medium | Needs product decision | Decide whether nearby page is in MVP scope or should be hidden/reworded as informational | Public route, not fully functional. |
| `src/components/contact/*`, `src/components/corrections/*`, `src/components/feedback/*`, `src/components/register/*`, `src/components/registration/*` | preview forms, static fields, nothing submitted/sent, future support/request shape | Public workflow preview copy | Medium | Needs product decision | Decide whether forms are acceptable as previews, should be hidden, or should be replaced with real workflow/contact instructions | Public trust impact if users expect submission. |
| `src/components/community/*` | placeholder channels, email updates preview, subscribe preview, preview channel | Public placeholder social/community channels | Medium | Needs product decision | Replace with official channels or hide channel cards until official links exist | Can look like official engagement paths. |
| `src/components/layout/Footer.tsx` | links to account, patient, booking, admin, provider-dashboard preview routes | Public navigation to preview-only routes | High | Hide from public UI | Remove/hide preview-route footer links before MVP public review unless intentionally part of demo | Footer makes preview pages discoverable. |
| `src/lib/public-listing-mappers.ts` | `Verified preview`; sample-only trust label; `createPreviewContactChannel`; `Pickup preview`; `Delivery preview`; profile preview | Mapper fallback/preview labels | Medium | Needs product decision | Replace preview trust labels with approved verification copy; keep mapper fallbacks safe until real data import | Central mapper can surface wording across many pages. |
| `src/lib/public-listing-mappers.ts` | diagnostics detail path returns `/diagnostics` for diagnostics cards in generic mapper | Route/link behavior | Medium | Needs product decision | Confirm diagnostics card detail links now use current helper/page wiring or adjust in a later code task if needed | Potential mismatch area for public navigation review. |
| `src/lib/supabase/diagnostics-public-read.ts` | `Static diagnostics data was returned`; `getStaticDiagnosticsFallbackCards`; `getStaticDiagnosticsFallbackDetail`; `Contact preview`; `Location preview`; `Sample collection...not listed` | Supabase fallback and public read labels | High | Replace with real data | Keep safe fallback until live runtime verified; replace fallback content after real diagnostics import | Current local runtime still returns safe fallback/error for diagnostics probes. |
| `src/lib/supabase/pharmacies-public-read.ts` | `getStaticPharmacyFallbackCards`; pickup/delivery/prescription preview labels; static pharmacy data returned | Supabase fallback and public read labels | Medium | Replace with real data | Replace static pharmacy fallback with real data once approved; keep fallback until runtime behavior is stable | Public route can fall back when env/client unavailable. |
| `src/lib/supabase/facilities-public-read.ts` | `Use static facility data`; `static-fallback`; `Supabase public listing preview` | Supabase fallback labels | Medium | Replace with real data | Decide whether fallback remains for QA or becomes hidden/empty after real data import | Facility fallback may still be visible. |
| `src/lib/supabase/doctors-public-read.ts` | `Use static doctor data`; `Request booking preview`; `profile preview`; telemedicine preview | Supabase fallback and preview labels | Medium | Needs product decision | Decide whether doctor booking/telemedicine preview labels stay informational or are removed until real workflows exist | Public doctor route and detail can surface these labels. |
| `src/lib/supabase/provider-contact-channels-public-read.ts` | `Use static or empty contact channel data`; `Contact detail not listed` | Contact-channel empty/fallback copy | Low | Keep for QA | Keep safe fallback behavior; review user-facing empty state only if surfaced in UI | Helper does not expose raw errors or secrets. |
| `scripts/probe-diagnostics.ts` | expected diagnostics public and blocked slugs | Probe QA fixture | Internal only | Keep for QA | Keep until replacement diagnostics QA dataset exists | Not public UI; supports current diagnostics limitation tracking. |
| `scripts/probe-diagnostics-detail.ts` | public, blocked, missing, and invalid diagnostics slugs | Probe QA fixture | Internal only | Keep for QA | Keep until detail probe is updated for real data | Includes invalid slug safety case. |
| `scripts/probe-pharmacies-public-read.ts` and `scripts/probe-pharmacy-detail-read.ts` | fallback result checks and sample label | Probe QA fixture | Internal only | Keep for QA | Keep unless probe expectations change during real data import | Not public UI. |
| `package.json` | no relevant search-term matches in scripts beyond probe script names not matching required terms | Package metadata | Low | Keep for QA | No cleanup action from this inventory | Package scripts remain unchanged. |
| `docs` | historical SQL drafts, QA records, setup guides, preview inventories, fictional/test data references | Documentation / historical records | Internal only | Keep for QA | Keep docs as audit trail; do not treat docs references as public cleanup work unless docs are published | Large number of matches are expected and useful. |

---

## Major Findings By Category

### Placeholder

- Public community/social channel placeholders exist in `src/data/seed-community-channels.ts`.
- Preview/form placeholders exist in contact, correction, feedback, registration, and account-related components.
- Placeholder variable examples exist in docs only and are internal.

### Test

- Diagnostics test slugs are used in scripts and documented QA records.
- Facility and doctor test slugs remain in internal probe pages.
- Historical SQL drafts and QA records contain fictional test data by design.

### Demo / Preview-Only

- Public pages and components use many `preview` labels.
- Public action panels still describe future actions and preview-only controls.
- Booking, patient account, provider dashboard, admin review, auth/account, registration, correction, contact, feedback, nearby, search, facility, doctor, pharmacy, and diagnostics areas all contain preview-only language.

### Fictional / Sample Provider Data

- `src/data/seed-*` files contain sample provider records that can look like real providers.
- Highest concern rows are sample/fallback provider names for facilities, doctors, pharmacies, and diagnostics.

### Static Fallback

- Supabase public read helpers intentionally preserve static fallback behavior.
- Fallback is still important for QA and safe runtime degradation, but the public content returned by fallback should be replaced with real-safe data before MVP review.

### Mock

- Search results, booking request preview, patient account preview, and provider dashboard preview use mock/static preview language.
- Mock content is acceptable for internal demos but should be hidden or clearly scoped before public MVP review.

### Seed

- Seed files are the main source of current public-facing fallback content.
- Seed metadata includes sample-only status and should remain until a real data source model replaces it.

### Empty-State / Not-Listed

- `Hours not listed`, `Availability not listed`, `Visit modes not listed`, `Telemedicine availability not listed`, and contact detail fallback labels appear across routes/helpers.
- These labels are safe, but should be reviewed for public polish and consistency.

---

## Highest-Risk Public Visibility Areas

Highest-risk areas for later cleanup:

1. `src/components/layout/Footer.tsx`

   Public footer links expose preview-only routes such as account, patient, booking, admin, and provider dashboard previews.

2. `src/components/home/*`

   Homepage copy includes sample and preview language in high-visibility sections.

3. `src/components/search-results/*`

   Search results mention frontend-only matches, sample results, and mock data.

4. `src/data/seed-facilities.ts`, `src/data/seed-doctors.ts`, `src/data/seed-pharmacies.ts`, `src/data/seed-diagnostics.ts`

   Sample provider names can look real and are used by public pages and fallback flows.

5. `src/app/facilities/addis-health-center/page.tsx` and `src/app/doctors/dr-hana-bekele/page.tsx`

   Static detail routes expose sample provider details directly.

6. `src/components/facility-detail/*` and `src/components/doctor-detail/*`

   Detail pages contain preview action panels and sample data notes.

7. `src/lib/supabase/diagnostics-public-read.ts`

   Diagnostics fallback currently matters because local/Codex runtime probes still do not verify live Supabase diagnostics rows.

---

## Recommended Next Task

Recommended next task:

```text
Task 172 - Placeholder and Test Data Classification Decisions
```

Recommended objective:

```text
Review this inventory and decide which items should be kept for QA, replaced with real data, hidden from public UI, removed after real data import, or escalated for product decision before implementation begins.
```

Task 172 should be decision-only unless the project owner explicitly approves implementation changes.

---

## Scope Confirmation

For Task 171:

- No source code was modified.
- No test data was deleted.
- No Supabase SQL was modified.
- No RLS was modified.
- No schema was modified.
- No Supabase migrations were modified.
- No real data was inserted.
- No static data was changed.
- No UI was changed.
- No brand, logo, colors, or routes were changed.
- No probe scripts were modified.
- No package scripts were modified.
- Task 172 was not created.

---

## Inventory Summary

This inventory identifies public-facing sample/preview/mock/static fallback content as the main cleanup risk before MVP review. Diagnostics SQL test rows should be kept for QA until real diagnostics replacement data and probe expectations are ready. The most urgent public cleanup decisions are preview-route exposure, homepage/search wording, static sample provider records, and fallback data behavior.
