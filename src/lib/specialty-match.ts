import {
  getSpecialtyAliases,
  matchesAnyAlias,
  matchesQueryTokens,
  splitQueryTokens,
} from "@/lib/frontend-search-filters";
import type { Facility } from "@/types/facility";

// A facility is "specialist-focused" for a specialty when the specialty is in
// its own NAME and it is not a general hospital or medical plaza.
//
// This proxy was chosen by measuring the alternatives against the live data.
// Including `subcategory` looked stronger but was not: it classified Habari
// Medical Plaza as specialist in seven of eight specialties, which by
// definition makes it specialist in none. The name is the claim a facility
// makes about itself, and excluding the two general categories stops
// "Lancet General Hospital" qualifying on the word "General Surgery".
const GENERAL_CATEGORIES = new Set(["general hospital", "medical plaza"]);

export function isSpecialistFocused(facility: Facility, specialty: string): boolean {
  const aliases = getSpecialtyAliases(specialty);
  if (!aliases.length) return false;
  if (GENERAL_CATEGORIES.has((facility.category ?? "").trim().toLowerCase())) return false;
  return matchesAnyAlias(facility.name ?? "", aliases);
}

// Ranks facilities whose main business is this specialty above general
// facilities that list it among many services.
//
// Worth building because the split is real in every specialty measured against
// 106 active facilities — Psychiatry 6 specialist / 4 general, Dermatology 5/7,
// Surgery 9/11, Ophthalmology 2/8, Pediatrics 3/23. Order within each group is
// preserved, so this only ever moves specialists up; it never reshuffles peers.
export function rankBySpecialtyFocus(facilities: Facility[], specialty: string): Facility[] {
  if (!specialty) return facilities;
  const specialists: Facility[] = [];
  const general: Facility[] = [];
  for (const facility of facilities) {
    (isSpecialistFocused(facility, specialty) ? specialists : general).push(facility);
  }
  return [...specialists, ...general];
}

// The service a facility lists that caused it to match, so a general hospital
// appearing in an eye-care list can show why it earned its place. Falls back to
// the specialty's own display label when the match came from the facility name
// rather than from a listed service.
// The one implementation of "which listed service caused this match", shared
// by the specialty landing pages and free-text search. Search asked the same
// question the specialty pages already answered, so it calls this rather than
// growing a second copy that would drift.
function listedServices(facility: Facility): string[] {
  const custom = Object.values(facility.customServiceCategories ?? {}).flat();
  return [...(facility.services ?? []), ...custom].filter(Boolean);
}

export function matchedServiceForAliases(
  facility: Facility,
  aliases: string[],
): string | undefined {
  if (!aliases.length) return undefined;
  return listedServices(facility).find((service) => matchesAnyAlias(service, aliases));
}

// Free-text form. Uses the query-token rule rather than the alias rule, for
// the same reason the result filter does: the visitor typed a prefix, and a
// card that matched on "lab" should be able to point at "Laboratory".
//
// The first service matching ANY token wins, not all of them — a facility can
// satisfy "lab test" across two separate tags, and showing one real tag beats
// showing none. "eeg" surfaces the EEG tag on a general hospital that would
// otherwise look unexplained in the results.
// Words of a service, for deciding whether a token IS one of them rather than
// merely starting one. "Urine analysis" splits to ["urine", "analysis"]; the
// token "ana" is neither, though it does prefix the second.
function serviceWords(service: string): string[] {
  return service.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

// How well one service answers one token. The prefix rule that decides whether
// a facility matches at all is deliberately loose — a visitor typing "lab"
// should reach "Laboratory" — but the chip on the card is a different
// question: of everything this facility offers, which one did they ask for?
// Taking the first service that merely passed the loose test answers it badly.
// Searching "ANA" on a laboratory that lists ANA highlighted "Urine analysis",
// because ana prefixes "analysis" and that entry sits earlier in the array.
// The chip named a test the visitor had not asked for while the one they had
// sat further down the same card.
function tokenMatchScore(service: string, token: string): number {
  const lower = service.toLowerCase();
  const t = token.toLowerCase();
  if (lower === t) return 3; // the service IS the token: "ANA" for "ana"
  if (serviceWords(service).includes(t)) return 2; // a whole word of it is
  return 1; // prefix only — still a match, just the weakest kind
}

export function matchedServiceForQuery(
  facility: Facility,
  query: string,
): string | undefined {
  const tokens = splitQueryTokens(query);
  if (!tokens.length) return undefined;
  const services = listedServices(facility);
  // A service that IS the whole query answers it before any per-token rule
  // gets a say. Scoring token by token cannot see this: "vitamin d" hands
  // "vitamin" to the loop below, where "Vitamin B12" and "Vitamin D" both
  // contain it as a whole word and the earlier one wins on position alone.
  const whole = query.trim().toLowerCase();
  const exact = services.find((service) => service.toLowerCase() === whole);
  if (exact) return exact;
  // Token order still decides which token gets to answer — a facility can
  // satisfy "lab test" across two tags, and the earlier word is the one the
  // visitor led with. What changed is that within a token the best match wins
  // instead of the earliest, so array position no longer outranks precision.
  for (const token of tokens) {
    let best: string | undefined;
    let bestScore = 0;
    for (const service of services) {
      if (!matchesQueryTokens(service, [token])) continue;
      const score = tokenMatchScore(service, token);
      if (score > bestScore) {
        best = service;
        bestScore = score;
      }
    }
    if (best) return best;
  }
  return undefined;
}

export function matchedServiceLabel(
  facility: Facility,
  specialty: string,
  fallbackLabel: string,
): string {
  return matchedServiceForAliases(facility, getSpecialtyAliases(specialty)) ?? fallbackLabel;
}

// The one specialty presented as a merged discipline. Psychiatry and
// psychology are separate professions but the listings do not separate them
// cleanly — 4 of the 10 matching facilities carry terms from both — and
// someone looking for help rarely arrives knowing which one they need. They
// share a chip; the specialty page offers this refinement for those who do.
//
// "counselling" alone is deliberately NOT a psychology term: it matched
// "Fertility counseling" at an OB/GYN clinic, which is not mental health
// care. Only the qualified forms count.
export const MENTAL_HEALTH_SPECIALTY = "Psychiatry & Mental Health";
const PSYCHIATRY_TERMS = ["psychiatry", "psychiatric"];
const PSYCHOLOGY_TERMS = ["psychology", "psychological", "psychotherapy"];

export type MentalHealthBranch = "psychiatry" | "psychology";

export function matchesMentalHealthBranch(
  facility: Facility,
  branch: MentalHealthBranch,
): boolean {
  const custom = Object.values(facility.customServiceCategories ?? {}).flat();
  const text = [
    facility.name,
    facility.category,
    facility.subcategory,
    ...(facility.services ?? []),
    ...custom,
  ].filter(Boolean).join(" ");
  return matchesAnyAlias(text, branch === "psychiatry" ? PSYCHIATRY_TERMS : PSYCHOLOGY_TERMS);
}

// Short display label for a specialty key. The keys carry parenthetical
// disambiguation ("Ophthalmology (Eye Care)") that reads as clutter in a
// headline or a pill.
export function specialtyDisplayLabel(specialty: string): string {
  return specialty.replace(/\s*\([^)]*\)\s*/g, "").trim() || specialty;
}
