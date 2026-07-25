import type { Metadata } from "next";
import Link from "next/link";

import { FacilityDetailPage } from "@/components/facility-detail/FacilityDetailPage";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageShell } from "@/components/layout/PageShell";
import {
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

  return {
    title: facility ? `${facility.name} — Tiru` : "Facility — Tiru",
    description: facility
      ? `${facility.category} in ${facility.location}, Addis Ababa.`
      : "",
  };
}

export default async function FacilityDetailRoute({
  params,
}: FacilityDetailRouteProps) {
  const { slug } = await params;
  const facility = await getFacilityBySlug(slug);

  if (!facility) {
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

  return (
    <PageShell>
      <FacilityDetailPage
        facility={facility}
        similarFacilities={await getSimilarFacilities(facility)}
      />
    </PageShell>
  );
}
