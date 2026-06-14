Implement Task 204: Apply Tiru Care Pathway Hospital-Themed UI.

We are moving away from the current plain neutral UI. Create a new, distinctive, professional hospital-themed design for Tiru.

This is a frontend redesign task, not a data task.

## Design concept

Tiru should feel like:

* hospital wayfinding
* care pathway navigation
* modern healthcare directory
* clean reception-desk search experience
* trustworthy private healthcare discovery
* mobile-first but desktop should also look intentional

The brand idea is:

Tiru helps users trace the right care.

Use subtle “pathway / route / care direction” design language, but do not make it decorative or cartoonish.

## Color palette

Apply this new hospital-themed palette:

* Warm Clinical Background: #F6FAF9
* Pure Surface White: #FFFFFF
* Deep Hospital Navy: #0B1F33
* Care Path Green: #0F8B6E
* Soft Mint Panel: #E6F4EF
* Pale Blue Gray: #EEF3F6
* Text Gray: #52616B
* Border Gray: #DDE5E8
* Warning Amber: #B7791F
* Error Red: #B42318

Usage:

* Deep Hospital Navy for primary text, header emphasis, and primary buttons.
* Care Path Green only for pathway accents, verified/location/success cues, active step indicators, and small highlights.
* Soft Mint Panel for calm medical panels.
* Pale Blue Gray for secondary surfaces.
* White for cards.
* Border Gray for clean separation.
* Avoid large teal/green blocks.
* Avoid gradients unless extremely subtle.
* Avoid the old plain black/white look.
* Avoid colorful startup styling.

## Global frontend direction

Rebuild the visible public UI to feel like a polished healthcare directory.

Focus on:

* better spacing
* stronger visual hierarchy
* intentional hero layout
* polished search module
* clean category cards
* professional nearby flow
* consistent facility cards
* mobile-first responsiveness
* desktop layout that no longer feels empty or raw

Do not simply change CSS variables. Replace old raw-looking layouts where needed.

## Header

Rebuild the header to match the new concept.

Requirements:

* Brand text: Tiru
* Tagline: Trace the right care.
* Header should feel like a clean hospital navigation bar.
* Use Deep Hospital Navy text.
* Keep search in header but make it visually balanced.
* Register action should be clear but not loud.
* Theme toggle should be compact.
* On mobile, header should not be crowded.
* Avoid raw button look.

## Homepage

Rebuild the homepage hero.

Preferred hero copy:

Title:
Find the right care, faster.

Subtitle:
Search private hospitals, clinics, diagnostics, doctors, and pharmacies across Addis Ababa.

Small pill:
Private healthcare discovery for Addis Ababa

Hero layout:

* On desktop, use a balanced two-column layout or a centered premium hero.
* Do not leave a huge empty right side.
* Include a polished search card as the main action.
* Include category chips/cards in a clean way.
* Include a clear nearby CTA such as “Find nearby care.”
* Use subtle pathway/route visual accents, not large decorative graphics.

Mobile:

* Stack hero, search, categories, and nearby CTA cleanly.
* Keep it fast and compact.

## Search module

Make search feel like the “reception desk” of the app.

Search card:

* white surface
* soft border
* 18–24px radius
* subtle shadow
* strong input
* primary navy search button
* category chips below
* good mobile spacing

## Category system

Use hospital wayfinding-style category cards/chips.

Categories:

* General Hospitals
* Specialty Centers
* Clinics
* Doctors
* Diagnostics
* Pharmacies

Each category card can include:

* small icon/letter marker if existing assets/icons allow
* title
* short one-line description
* subtle right arrow or pathway cue

Do not add external packages.

## Nearby page

Rebuild Nearby using the “Care near you” pathway concept.

Nearby should guide the user:

1. Choose care type
2. Use my location
3. See nearest options

Requirements:

* Keep current geolocation/distance logic.
* Keep category selection.
* Keep Browse by Area fallback.
* Do not show huge area chip wall by default.
* Use Care Path Green for step indicators/location cue only.
* Use Deep Hospital Navy for primary action.
* Results should look like professional provider cards.
* Distance appears only when coordinates exist.
* Do not fake distance.

## Facility/result cards

Cards should feel like provider identity cards.

Each card should have:

* facility/provider name
* category badge
* area/sub-city/address
* key services if available
* distance if available
* actions: View details, Call, Open map where available

Style:

* white card
* subtle border
* consistent radius
* clean spacing
* professional typography
* primary action in Deep Hospital Navy
* small green accents only for verified/location cues

## Buttons and chips

Primary button:

* Deep Hospital Navy background #0B1F33
* white text

Secondary button:

* white background
* Border Gray border
* Deep Hospital Navy text

Active chip:

* Deep Hospital Navy background
* white text

Pathway/location accents:

* Care Path Green #0F8B6E

## Typography

Use existing font stack. Do not add packages.

Improve:

* heading line-height
* natural font weight
* less excessive letter spacing
* readable body text
* clean labels and metadata

## Routes to update/review

Prioritize:

* /
* /nearby
* /facilities
* /facilities/[slug]
* /search
* /diagnostics
* /doctors
* /pharmacies

## Safety

Do not modify:

* Supabase SQL/RLS/schema/migrations
* data import scripts
* real facility source data
* package.json
* package-lock.json

Do not:

* add new packages
* import data
* create fake/demo/placeholder listings
* remove existing real facility behavior
* break contact actions
* break nearby distance logic

## Validation

Run:
npm.cmd run lint
npm.cmd run build

If npm.cmd is unavailable in Codex shell, run equivalent validation and report clearly.

## Final report

Report:

* files changed
* color/theme changes
* header changes
* homepage redesign
* search/category changes
* nearby redesign
* card/button changes
* validation results
* remaining issues
