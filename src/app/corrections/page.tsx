import type { Metadata } from "next";
import { Suspense } from "react";
import { CorrectionsPage } from "@/components/corrections/CorrectionsPage";
import { PageShell } from "@/components/layout/PageShell";
import { getFacilityBySlug } from "@/lib/supabase/get-facilities";

export const metadata: Metadata = {
  title: "Suggest a Correction — Tiru",
  description:
    "Help keep Tiru accurate by suggesting corrections to provider listings.",
};

type CorrectionsRouteProps = {
  searchParams: Promise<{ facility?: string; listing?: string }>;
};

export default async function CorrectionsRoute({
  searchParams,
}: CorrectionsRouteProps) {
  const params = await searchParams;
  const slug = params.facility ?? params.listing ?? null;
  const facility = slug ? await getFacilityBySlug(slug) : null;

  return (
    <PageShell>
      <Suspense>
        <CorrectionsPage facility={facility} />
      </Suspense>
    </PageShell>
  );
}
