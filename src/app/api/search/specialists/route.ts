import { NextRequest, NextResponse } from "next/server";
import { getAllSpecialists } from "@/lib/supabase/get-specialists";
import { formatDoctorDisplayName, stripDoctorNamePrefix } from "@/lib/provider/doctor-types";
import { matchesQueryTokens, splitQueryTokens } from "@/lib/frontend-search-filters";

// Backs the general search autosuggest dropdown's specialist matches (see
// src/components/search/use-facility-suggestions.ts). Separate from
// /api/provider/search-facilities so the provider "claim your facility"
// flow (which reuses that same facility-suggestions hook) never has to
// worry about specialist results leaking into it.
//
// Previously a raw .includes() substring check, which has the same
// unbounded-match shape as the facility route's old SQL ilike — e.g. a
// "Dentistry" specialty contains "ent" as a substring. Uses
// matchesQueryTokens/splitQueryTokens now, the same matcher /search and the
// facility suggestions route use, rather than a third hand-rolled check.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ specialists: [] });
  }

  // Strip a typed title prefix from the query too, so "dr anteneh" and
  // "anteneh" both match — mirrors the same normalization applied to the
  // stored name.
  const normalizedQuery = stripDoctorNamePrefix(q).toLowerCase();
  const tokens = splitQueryTokens(normalizedQuery);

  const specialists = await getAllSpecialists();
  const matches = specialists
    .filter((s) => {
      const cleanName = stripDoctorNamePrefix(s.fullName).toLowerCase();
      const haystack = [cleanName, s.specialty, s.facilityName].filter(Boolean).join(" ");
      return matchesQueryTokens(haystack, tokens);
    })
    .slice(0, 8);

  return NextResponse.json({
    specialists: matches.map((s) => ({
      id: s.id,
      name: formatDoctorDisplayName(s.title, s.fullName),
      slug: s.slug,
      metadata: [s.specialty, s.facilityName].filter(Boolean).join(" · "),
      detailHref: `/specialists/${s.slug}`,
    })),
  });
}
