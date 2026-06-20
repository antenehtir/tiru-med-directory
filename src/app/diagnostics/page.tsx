import type { Metadata } from "next";
import { DiagnosticsPage } from "@/components/diagnostics/DiagnosticsPage";
import { PageShell } from "@/components/layout/PageShell";
import { realFacilities } from "@/data/real-facility-profiles";
import { normalizeSearchParam } from "@/lib/frontend-search-filters";
import type { Facility } from "@/types/facility";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Diagnostics — Tiru",
  description: "Labs, imaging centers and diagnostic services in Addis Ababa.",
};

type DiagnosticsRouteProps = {
  searchParams?: Promise<{
    type?: string | string[];
  }>;
};

export default async function DiagnosticsRoute({
  searchParams,
}: DiagnosticsRouteProps) {
  const params = await searchParams;
  const activeType = normalizeSearchParam(params?.type);
  const diagnostics = filterByType(await getDiagnosticsForRoute(), activeType);

  return (
    <PageShell>
      <DiagnosticsPage activeType={activeType} diagnostics={diagnostics} />
    </PageShell>
  );
}

async function getDiagnosticsForRoute(): Promise<Facility[]> {
  const exactMatches = realFacilities.filter(
    (facility) => facility.category === "Diagnostic Center",
  );

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  return realFacilities.filter(
    (facility) => facility.category.toLowerCase() === "diagnostic center",
  );
}

function filterByType(diagnostics: Facility[], type: string): Facility[] {
  if (!type) {
    return diagnostics;
  }

  return diagnostics.filter((facility) => {
    const searchableText = [
      facility.category,
      facility.subcategory,
      facility.name,
      ...facility.services,
    ]
      .join(" ")
      .toLowerCase();

    if (type === "laboratory") {
      return /laboratory|lab\b/.test(searchableText);
    }

    if (type === "imaging") {
      return /imaging|radiology/.test(searchableText);
    }

    return true;
  });
}
