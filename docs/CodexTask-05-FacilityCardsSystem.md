# Codex Task 05: Facility Cards System

## Project

DigitalDirectory-v2

## Goal

Create a reusable facility card system for DigitalDirectory-v2.

Facility cards will become one of the most important UI components in the platform because they will be used across:

- Homepage
- Search results
- Nearby care page
- Facility category pages
- Future map/list views
- Future provider detail previews

This task is frontend-only.

Do not add backend functionality.

---

## Important Context

Before making changes, read:

- docs/ProductVision.md
- docs/Architecture.md
- docs/DevelopmentRoadmap.md
- docs/DesignSystem.md
- docs/CodexTask-01-DesignSystemSetup.md
- docs/CodexTask-02-CoreLayoutShell.md
- docs/CodexTask-03-HomepageStructure.md
- docs/CodexTask-04-SearchExperienceUI.md
- docs/CodexTask-05-FacilityCardsSystem.md

Follow the established product direction and design system.

---

## Current Status

Task 01 created the initial design system.

Task 02 created the core layout shell.

Task 03 created the homepage structure.

Task 04 improved the search experience UI.

Task 05 should now create a polished reusable facility card system.

---

## Stack

- Next.js
- TypeScript
- TailwindCSS
- App Router
- src directory

---

## Main Objective

Create reusable facility card components that communicate:

1. What the facility is
2. Where it is located
3. Whether it is verified
4. Whether it is open/available
5. What action the user can take next

The card must feel:

- Clean
- Trustworthy
- Mobile-friendly
- Healthcare-specific
- Easy to scan
- Action-oriented

---

## Suggested Folder Structure

Create or update:

```text
src/components/cards/
src/components/trust/
src/types/
src/data/