# Codex Task 113: Doctor Detail Runtime Probe

## Goal

Create a temporary internal runtime probe to verify the doctor detail helper inside the real Next app runtime before wiring `/doctors/[slug]`.

## Context

Read:

- docs/DoctorDetailReadPlanning.md
- docs/DoctorsPageSupabaseWiringQARecord.md
- docs/CodexTask-112-DoctorDetailSupabaseReadHelperImplementation.md

Inspect:

- src/lib/supabase/doctors-public-read.ts
- src/lib/supabase/public-client.ts
- src/app/internal/doctors-public-read-probe/page.tsx
- src/app/doctors/page.tsx

## Implement

Create:

```text
src/app/internal/doctor-detail-probe/page.tsx