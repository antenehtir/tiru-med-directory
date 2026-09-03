import type { Metadata } from "next";
import { Suspense } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { SearchResultsPage } from "@/components/search-results/SearchResultsPage";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";
import { getDoctorsForSearch } from "@/lib/supabase/get-doctors-for-search";
import { getAllSpecialists } from "@/lib/supabase/get-specialists";

// 1hr revalidate meant edits/approvals could take up to an hour to appear —
// matched to the 60s window used by the other listing pages.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Search — Tiru",
  description: "Search private healthcare providers in Addis Ababa.",
};

export default async function SearchPage() {
  // Two independent specialist sources (see the doctors-public-read.ts vs.
  // get-specialists.ts split) — both are surfaced here rather than picking
  // one, since the `doctors` table path may still hold real records
  // independent of the facility-embedded specialists most providers add
  // through onboarding.
  const [doctors, specialists, facilities] = await Promise.all([
    getDoctorsForSearch(),
    getAllSpecialists(),
    getFacilitiesFromDB(),
  ]);

  return (
    <PageShell>
      <Suspense>
        <SearchResultsPage doctors={doctors} facilities={facilities} specialists={specialists} />
      </Suspense>
    </PageShell>
  );
}
