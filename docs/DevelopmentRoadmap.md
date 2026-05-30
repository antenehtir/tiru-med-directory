# DigitalDirectory-v2 Development Roadmap

## Goal

Build a modern, mobile-first, trust-focused healthcare discovery platform for Ethiopia.

The platform must help patients and doctors quickly find, verify, and connect with trusted healthcare services.

---

## Development Method

Development will be done step by step.

Each phase must be completed, tested, committed, and pushed before moving to the next phase.

Do not build too many features at once.

---

## Phase 1: Project Foundation

### Objective
Set up a clean technical foundation for the new platform.

### Tasks
- Initialize Next.js project
- Set up TypeScript
- Set up TailwindCSS
- Set up ESLint
- Confirm local development works
- Push initial project to GitHub

### Status
Completed

---

## Phase 2: Design System

### Objective
Create a unified visual language for the platform.

### Tasks
- Define brand colors
- Define typography
- Define spacing system
- Define button styles
- Define card styles
- Define input/search styles
- Define badge styles
- Define mobile-first layout rules

### Output
A consistent healthcare UI system that feels modern, trustworthy, and simple.

---

## Phase 3: Core Layout Shell

### Objective
Create the main app structure.

### Tasks
- Create main header
- Create desktop navigation
- Create mobile bottom navigation
- Create page container
- Create responsive layout system
- Add basic footer

### Output
A clean responsive shell for the platform.

---

## Phase 4: Homepage

### Objective
Build the main landing page.

### Sections
- Hero search section
- Quick category buttons
- Nearby healthcare section
- Verified facilities section
- Popular specialties
- Pharmacy discovery
- Doctor discovery
- Facility registration CTA
- Trust explanation section

### Output
A homepage that immediately communicates trust, clarity, and fast healthcare discovery.

---

## Phase 5: Search Experience

### Objective
Make search the central product experience.

### Tasks
- Create search bar component
- Add category filtering
- Add location filtering
- Add verified-only filter
- Add open-now filter
- Add empty state
- Add mobile search experience

### Output
Users should be able to find relevant healthcare services quickly.

---

## Phase 6: Facility Cards

### Objective
Create reusable facility listing cards.

### Facility Card Must Show
- Facility name
- Category
- Location
- Verification badge
- Open or closed status
- Phone CTA
- Direction CTA
- View details CTA

### Output
Clear, trustworthy, action-oriented facility cards.

---

## Phase 7: Doctor Cards

### Objective
Create reusable doctor listing cards.

### Doctor Card Must Show
- Doctor name
- Specialty
- Verification status
- Facility affiliation
- Availability
- View profile CTA

### Output
Simple doctor discovery experience.

---

## Phase 8: Detail Pages

### Objective
Create detailed pages for facilities and doctors.

### Facility Detail Page
- Facility name
- Verification badge
- Location
- Services
- Working hours
- Doctors available
- Phone
- Directions
- Request correction button

### Doctor Detail Page
- Doctor name
- Specialty
- Facility
- Availability
- Verification status
- Contact CTA

---

## Phase 9: Registration and Verification Flow

### Objective
Allow doctors and facilities to request listing or verification.

### Tasks
- Create registration page
- Create doctor registration form
- Create facility registration form
- Create correction request form
- Add verification status system

### Output
A trust-building onboarding flow.

---

## Phase 10: Data Migration

### Objective
Move useful data from the old DigitalDirectory project into the new structure.

### Tasks
- Extract healthcare categories
- Extract facility data
- Clean facility fields
- Convert old data into structured TypeScript data files
- Prepare for future database migration

---

## Phase 11: Mobile Optimization

### Objective
Make the platform feel like a mobile app.

### Tasks
- Improve touch targets
- Optimize spacing
- Improve mobile navigation
- Reduce scroll fatigue
- Optimize search on mobile
- Test on Android screen sizes

---

## Phase 12: Future Backend

### Objective
Prepare for real database and admin workflow.

### Future Stack
- Supabase
- Authentication
- Facility dashboard
- Doctor dashboard
- Admin review panel
- Verification document upload

---

## Phase 13: Future Advanced Features

### Features
- Nearby search with maps
- Online booking
- Telemedicine integration
- Pharmacy availability
- AI healthcare assistant
- Amharic search
- E-prescription workflow

---

## Non-Negotiable Rules

1. Search comes before browsing.
2. Trust comes before promotion.
3. Mobile comes before desktop.
4. Verified and unverified listings must look different.
5. Do not overload the homepage.
6. Do not build secondary features before core discovery works.
7. Every phase must be tested before moving forward.

---

## Target Product Score

Current target:

9/10 initial product quality.

This will be reached through:
- clean architecture
- excellent mobile UX
- strong trust signals
- fast search
- consistent UI
- patient-first design