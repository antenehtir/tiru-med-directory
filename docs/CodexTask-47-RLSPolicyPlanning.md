# Codex Task 47: RLS Policy Planning

## Project

DigitalDirectory-v2

## Goal

Create a documentation-only planning document for future Supabase Row Level Security policies, including public read access, private/internal table protection, provider owner permissions, admin/reviewer permissions, patient data protection later, audit log access rules, service role boundaries, and policy testing checklist.

This task is documentation-only.

Do not add SQL.

Do not add RLS policies.

Do not add migrations.

Do not add Supabase code.

Do not add backend functionality.

Do not add authentication.

Do not create dashboards.

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
- docs/AdminReviewWorkflowPlanning.md
- docs/GovernanceRolesSuperAdminStrategy.md
- docs/DoctorProfileScheduleContentStrategy.md
- docs/FacilityProfileManagementStrategy.md
- docs/PatientReviewsRatingsStrategy.md
- docs/PatientIdentityConsentStrategy.md
- docs/BookingSchedulingStrategy.md
- docs/PaymentsWalletStrategy.md
- docs/PatientTransportRideHailingStrategy.md
- docs/PatientDocumentVaultRecordsStrategy.md
- docs/ListingSharingReferralStrategy.md
- docs/NotificationReminderStrategy.md
- docs/ChatbotAssistantAISafetyStrategy.md
- docs/CommunitySupportGroupsStrategy.md
- docs/SeedDataStructure.md
- docs/CodexTask-45-SupabaseEnvironmentSetupGuide.md
- docs/CodexTask-46-PublicListingSchemaDraft.md
- docs/CodexTask-47-RLSPolicyPlanning.md

Follow the established product direction.

---

## Current Status

Tasks 01–46 created:

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

The app is still frontend-only.

Task 47 should define RLS policy planning before any actual SQL policies, Supabase auth, backend integration, dashboards, or protected workflows are implemented.

---

## Main Objective

Create a new documentation file:

```text
docs/RLSPolicyPlanning.md