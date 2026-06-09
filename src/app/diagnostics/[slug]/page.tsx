import { notFound } from "next/navigation";

import { FacilityDetailPage } from "@/components/facility-detail/FacilityDetailPage";
import { PageShell } from "@/components/layout/PageShell";
import {
  getSupabasePublicDiagnosticDetailBySlug,
  type DiagnosticPublicDetailReadResult,
} from "@/lib/supabase/diagnostics-public-read";
import type { Facility } from "@/types/facility";
import type { PublicProviderDetail } from "@/types/public-listings";

export const dynamic = "force-dynamic";

type DiagnosticsDetailRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function DiagnosticsDetailRoute({
  params,
}: DiagnosticsDetailRouteProps) {
  const { slug } = await params;
  const result = await getSafeDiagnosticsDetail(slug);

  if (result.status !== "success") {
    notFound();
  }

  return (
    <PageShell>
      <FacilityDetailPage
        facility={mapPublicProviderDetailToDiagnosticsFacility(result.detail)}
      />
    </PageShell>
  );
}

async function getSafeDiagnosticsDetail(
  slug: string,
): Promise<DiagnosticPublicDetailReadResult> {
  try {
    return await getSupabasePublicDiagnosticDetailBySlug(slug);
  } catch {
    return {
      status: "error",
      source: "static-fallback",
      detail: null,
      fallbackRecommended: true,
      reason: "query-failed",
      errorCode: "DIAGNOSTICS_DETAIL_PUBLIC_READ_FAILED",
      message:
        "Supabase diagnostics detail public read failed. Use not-found handling.",
    };
  }
}

function mapPublicProviderDetailToDiagnosticsFacility(
  detail: PublicProviderDetail,
): Facility {
  const category = detail.categoryLabel;

  return {
    id: detail.id,
    name: detail.name,
    slug: detail.slug,
    category,
    subcategory: detail.description || detail.summary,
    services: detail.services.length > 0 ? detail.services : [category],
    location: detail.location.displayName || detail.locationLabel,
    address: detail.address ?? detail.locationLabel,
    workingHours: detail.workingHours,
    verificationStatus: detail.verificationStatus,
    isOpen: false,
    availabilityNote:
      detail.availabilityPreview ?? "Sample collection details not listed",
    contactActionLabel: detail.primaryActionLabel,
    directionsActionLabel: detail.secondaryActionLabel,
    contactChannels: [],
  };
}
