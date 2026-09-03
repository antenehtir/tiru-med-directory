import { NextRequest, NextResponse } from "next/server";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";
import { getDoctorsForSearch } from "@/lib/supabase/get-doctors-for-search";
import { getAllSpecialists } from "@/lib/supabase/get-specialists";
import { getServiceSuggestions } from "@/lib/service-suggestions";

// Backs the service rows in the general search autosuggest dropdown (see
// src/components/search/use-facility-suggestions.ts).
//
// No SQL of its own. Service tags live inside the facility records, so this
// reads the list through getFacilitiesFromDB(), which holds a 60-second
// module-level cache that the listing pages already keep warm. Doctors and
// specialists are also loaded — via the same getDoctorsForSearch()/
// getAllSpecialists() calls /search's own page uses, specialists cached the
// same way — because a tag's count has to fold in a specialist matching that
// tag's text (a "Pediatrics" suggestion undercounted itself by 1 before this,
// since a specialist whose specialty is Pediatrics doesn't show up in a
// facilities-only count). Doctors currently contributes 0 to every count —
// the `doctors` table is empty — but it's included so the total stays
// identical to /search's own if that ever changes, rather than counting
// facilities and specialists correctly and quietly missing doctors.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ services: [] });
  }

  const [facilities, doctors, specialists] = await Promise.all([
    getFacilitiesFromDB(),
    getDoctorsForSearch(),
    getAllSpecialists(),
  ]);
  const services = getServiceSuggestions(facilities, doctors, specialists, q);

  return NextResponse.json({
    services: services.map(({ tag, resultCount }) => ({
      id: `service:${tag}`,
      name: tag,
      // The type and the payoff share the metadata slot the facility and
      // specialist rows already use, so the row component is unchanged. The
      // word "facilities" here matches /search's own count line, which uses
      // it as the umbrella word for its combined facility+doctor+specialist
      // total rather than switching vocabulary per result type.
      metadata: `Service · ${resultCount} ${resultCount === 1 ? "facility" : "facilities"}`,
      detailHref: `/search?q=${encodeURIComponent(tag)}`,
    })),
  });
}
