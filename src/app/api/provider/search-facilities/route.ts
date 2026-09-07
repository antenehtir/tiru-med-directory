import { NextRequest, NextResponse } from "next/server";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";
import { matchesQueryTokens, splitQueryTokens } from "@/lib/frontend-search-filters";

// Backs the facility rows in the general search autosuggest dropdown, and is
// also called directly by the provider "claim your facility" search
// (ClaimFacilityForm.tsx) — the response shape (snake_case sub_city and
// verification_status) is that older contract and is kept as-is even though
// the fields now come off the typed Facility model.
//
// Previously matched name/area/sub_city/category with a raw SQL ilike
// substring, which is why "ent" matched "Adera Medical and Surgical CENTer"
// and 9 other false positives — the same class of bug /search had before its
// matcher was fixed. Now reads through getFacilitiesFromDB() (the same
// 60-second-cached list /search itself uses) and applies
// matchesQueryTokens/splitQueryTokens — the same word-boundary-aware matcher
// /search runs — rather than adding a second SQL-shaped implementation of it.
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ facilities: [] });
  }

  const tokens = splitQueryTokens(q);
  const facilities = await getFacilitiesFromDB();

  // WHERE the query matched decides the order, not the alphabet.
  //
  // The rows were sorted by name alone, which meant the field that produced
  // the match was thrown away. Typing "silk" put "Abed Dermatology and
  // Venerology Speciality Clinic" first — matched on its sub-city, "nifas
  // silk-lafto" — and pushed Silkroad General Hospital, whose NAME is the
  // thing being typed, below it. A person typing a facility's name is asking
  // for that facility, not for everything in a district whose name shares a
  // syllable with it.
  //
  // Tiers, in the order a searcher means them: the facility itself, then what
  // it offers, then where it is. Alphabetical still breaks ties inside a tier,
  // so the list stays stable between keystrokes.
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const startsWithQuery = new RegExp(`^${escaped}`, "i");
  const wordStartsWithQuery = new RegExp(`\\b${escaped}`, "i");

  function matchTier(facility: { name: string; category?: string | null }): number {
    if (startsWithQuery.test(facility.name)) return 0; // "silk" → "Silkroad…"
    if (wordStartsWithQuery.test(facility.name)) return 1; // "general" → "Yanet General…"
    if (matchesQueryTokens(facility.name, tokens)) return 2; // name matches some other way
    if (matchesQueryTokens(facility.category ?? "", tokens)) return 3; // what it does
    return 4; // area or sub-city only — a place, not a facility
  }

  const matches = facilities
    .filter((facility) => {
      const haystack = [facility.name, facility.category, facility.area, facility.subCity]
        .filter(Boolean)
        .join(" ");
      return matchesQueryTokens(haystack, tokens);
    })
    .sort((a, b) => matchTier(a) - matchTier(b) || a.name.localeCompare(b.name))
    .slice(0, 10)
    .map((facility) => ({
      id: facility.id,
      slug: facility.slug,
      name: facility.name,
      category: facility.category,
      area: facility.area ?? null,
      sub_city: facility.subCity ?? null,
      verification_status: facility.verificationStatus,
    }));

  return NextResponse.json({ facilities: matches });
}
