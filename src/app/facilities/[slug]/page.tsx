import type { Metadata } from "next";
import Link from "next/link";

import { FacilityDetailPage } from "@/components/facility-detail/FacilityDetailPage";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageShell } from "@/components/layout/PageShell";
import {
  getFacilityBySlug,
  getSimilarFacilities,
} from "@/lib/supabase/get-facilities";

export const revalidate = 60;

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

  return (
    <PageShell>
      <FacilityDetailPage
        facility={facility}
        similarFacilities={await getSimilarFacilities(facility)}
      />
    </PageShell>
  );
}
