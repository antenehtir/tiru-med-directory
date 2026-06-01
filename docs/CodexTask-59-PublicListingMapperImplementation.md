# Codex Task 59: Public Listing Mapper Implementation

## Project

DigitalDirectory-v2

## Goal

Create a controlled public listing mapper/type layer using current static data only, so future Supabase rows can later map into the same UI-safe shape.

This task may add TypeScript types and mapper/helper functions.

Do not use Supabase queries.

Do not modify existing public listing page behavior.

Do not connect pages to the new mapper layer yet unless it is purely non-behavior-changing and clearly safe.

Do not add backend functionality.

Do not add authentication.

Do not add SQL.

Do not add migrations.

Do not add RLS policies.

Do not add protected routes.

Do not add real data writes.

---

## Important Context

Before making changes, read:

- docs/ProductVision.md
- docs/Architecture.md
- docs/DevelopmentRoadmap.md
- docs/SupabaseBackendPlanning.md
- docs/SupabaseIntegrationPhase1.md
- docs/SupabaseEnvironmentSetupGuide.md
- docs/PublicListingSchemaDraft.md
- docs/RLSPolicyPlanning.md
- docs/SupabaseClientSetupPlanning.md
- docs/PublicListingReadIntegrationPlan.md
- docs/PublicListingReadImplementationPrep.md
- docs/SupabaseTestProjectChecklist.md
- docs/PublicListingDataMapperPlanning.md
- docs/StaticToSupabaseSourceSwitchPlanning.md
- docs/SeedDataStructure.md
- docs/CodexTask-57-StaticToSupabaseSourceSwitchPlanning.md
- docs/CodexTask-58-SupabasePackageClientSetup.md
- docs/CodexTask-59-PublicListingMapperImplementation.md

Follow the established product direction.

---

## Current Status

Tasks 01–58 created:

- Public frontend discovery system
- Facility and doctor detail previews
- Provider registration preview
- Correction flow preview
- Contact/support page
- Feedback loop
- Community/social update layer
- Auth/account preview
- Seed data structure
- User roles strategy
- Data model planning
- Supabase backend planning
- Admin review workflow planning
- Governance roles and Super Admin strategy
- Doctor profile, schedule, and content strategy
- Facility profile and management strategy
- Patient reviews and ratings strategy
- Patient identity and consent strategy
- Booking and scheduling strategy
- Payments and wallet strategy
- Patient transport and ride-hailing strategy
- Patient document vault and records sharing strategy
- Listing sharing and referral strategy
- Notification and reminder strategy
- Chatbot assistant and AI safety strategy
- Community and support groups strategy
- Supabase Integration Phase 1 strategy
- Supabase Environment Setup Guide
- Public Listing Schema Draft
- RLS Policy Planning
- Supabase Client Setup Planning
- Public Listing Read Integration Plan
- Provider Dashboard UI Preview
- Patient Account UI Preview
- Booking Request UI Preview
- Admin Review UI Preview
- Public Listing Read Implementation Preparation
- Supabase Test Project Checklist
- Public Listing Data Mapper Planning
- Static-to-Supabase Source Switch Planning
- Supabase Package and Client Setup

The app currently works as a frontend/static public directory with preview pages.

Task 59 should add the stable public listing mapper/type layer without changing live page data behavior.

---

## Main Objective

Create a public listing mapper layer.

Possible files:

```text
src/types/public-listings.ts
src/lib/public-listing-mappers.ts