import { NextRequest, NextResponse } from "next/server";
import { getAllSpecialists } from "@/lib/supabase/get-specialists";
import { formatDoctorDisplayName, stripDoctorNamePrefix } from "@/lib/provider/doctor-types";

// Backs the general search autosuggest dropdown's specialist matches (see
// src/components/search/use-facility-suggestions.ts). Separate from
// /api/provider/search-facilities so the provider "claim your facility"
// flow (which reuses that same facility-suggestions hook) never has to
// worry about specialist results leaking into it.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ specialists: [] });
  }

  // Strip a typed title prefix from the query too, so "dr anteneh" and
  // "anteneh" both match — mirrors the same normalization applied to the
  // stored name.
  const normalizedQuery = stripDoctorNamePrefix(q).toLowerCase();

  const specialists = await getAllSpecialists();
  const matches = specialists
    .filter((s) => {
      const cleanName = stripDoctorNamePrefix(s.fullName).toLowerCase();
      return (
        cleanName.includes(normalizedQuery) ||
        s.specialty.toLowerCase().includes(normalizedQuery) ||
        s.facilityName.toLowerCase().includes(normalizedQuery)
      );
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
