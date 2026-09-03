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

  const matches = facilities
    .filter((facility) => {
      const haystack = [facility.name, facility.category, facility.area, facility.subCity]
        .filter(Boolean)
        .join(" ");
      return matchesQueryTokens(haystack, tokens);
    })
    .sort((a, b) => a.name.localeCompare(b.name))
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
