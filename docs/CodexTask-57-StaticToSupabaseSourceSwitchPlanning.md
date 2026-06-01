# Codex Task 57: Static-to-Supabase Source Switch Planning

## Project

DigitalDirectory-v2

## Goal

Create a documentation-only planning document for how DigitalDirectory-v2 can later switch safely between current static seed data and future Supabase-backed public listing data.

This task is documentation-only.

Do not add Supabase code.

Do not add feature flag code.

Do not add mapper code.

Do not install packages.

Do not create `.env` files.

Do not add SQL.

Do not add migrations.

Do not add RLS policies.

Do not add authentication.

Do not add backend functionality.

Do not add protected routes.

Do not modify frontend UI.

---

## Important Context

Before making changes, read:

- docs/ProductVision.md
- docs/Architecture.md
- docs/DevelopmentRoadmap.md
- docs/UserRolesAccountStrategy.md
- docs/DataModelContentStructure.md
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
- docs/SeedDataStructure.md
- docs/CodexTask-55-SupabaseTestProjectChecklist.md
- docs/CodexTask-56-PublicListingDataMapperPlanning.md
- docs/CodexTask-57-StaticToSupabaseSourceSwitchPlanning.md

Follow the established product direction.

---

## Current Status

Tasks 01–56 created:

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

The app currently works as a frontend/static public directory with preview pages.

Task 57 should define how to later switch between static data and Supabase public listing reads without breaking the current public site.

---

## Main Objective

Create a new documentation file:

```text
docs/StaticToSupabaseSourceSwitchPlanning.md