import type { Metadata } from "next";
import Link from "next/link";

import { FacilityDetailPage } from "@/components/facility-detail/FacilityDetailPage";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageShell } from "@/components/layout/PageShell";
import { computeServiceFrequency } from "@/lib/facility/service-groups";
import {
  getFacilitiesFromDB,
  getFacilityBySlug,
  getSimilarFacilities,
} from "@/lib/supabase/get-facilities";

// Detail pages show provider live-edits and admin approvals — these must be
// visible immediately, not bounded by an ISR window. force-dynamic renders
// fresh on every request (getFacilityBySlug already queries Supabase
// directly, uncached).
export const dynamic = "force-dynamic";

type FacilityDetailRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: FacilityDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const facility = await getFacilityBySlug(slug);
  // Only a listed facility names itself in the tab title and the search
  // snippet — a deactivated one or an unpublished draft does not.
  const listed = facility && facility.isActive !== false && !facility.isDraft ? facility : null;

  return {
    title: listed ? `${listed.name} — Tiru` : "Facility — Tiru",
    description: listed ? `${listed.category} in ${listed.location}, Addis Ababa.` : "",
  };
}

export default async function FacilityDetailRoute({
  params,
}: FacilityDetailRouteProps) {
  const { slug } = await params;
  const facility = await getFacilityBySlug(slug);

  // A draft was never listed, so it reads as not found rather than as
  // "no longer listed".
  if (!facility || facility.isDraft) {
    return (
      <PageShell>
        <PageContainer className="py-16 text-center">
          <p className="text-base leading-7 text-muted-foreground">
            Facility not found.{" "}
            <Link className="font-semibold text-primary" href="/facilities">
              Browse all facilities &rarr;
            </Link>
          </p>
        </PageContainer>
      </PageShell>
    );
  }

  if (facility.isActive === false) {
    return (
      <PageShell>
        <PageContainer className="py-16 text-center">
          <p className="text-lg font-semibold text-foreground">
            This facility is no longer listed on Tiru Medical Directory.
          </p>
          <p className="mt-2 text-base text-muted-foreground">
            The listing may have closed, moved, or been removed.{" "}
            <Link className="font-semibold text-primary" href="/facilities">
              Browse active facilities &rarr;
            </Link>
          </p>
        </PageContainer>
      </PageShell>
    );
  }

  // Reads the same 60-second-cached list the listing pages use — a stale
  // popularity ranking for up to a minute is not the freshness problem
  // getFacilityBySlug's own no-store read exists to solve; only the
  // facility's OWN live data needs to be exact on every request.
  const allFacilities = await getFacilitiesFromDB();

  return (
    <PageShell>
      <FacilityDetailPage
        facility={facility}
        serviceFrequency={computeServiceFrequency(allFacilities)}
        similarFacilities={await getSimilarFacilities(facility)}
      />
    </PageShell>
  );
}
