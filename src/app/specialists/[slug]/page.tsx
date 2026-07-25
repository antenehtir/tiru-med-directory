import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageShell } from "@/components/layout/PageShell";
import { SpecialistDetailPage } from "@/components/specialists/SpecialistDetailPage";
import { getAllSpecialists, getSpecialistBySlug } from "@/lib/supabase/get-specialists";

// Detail pages show provider live-edits and admin approvals — these must be
// visible immediately, not bounded by an ISR window. force-dynamic renders
// fresh on every request (getSpecialistBySlug queries Supabase directly,
// bypassing the specialists-list cache — see get-specialists.ts).
export const dynamic = "force-dynamic";

type SpecialistDetailRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: SpecialistDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const specialist = await getSpecialistBySlug(slug);

  return {
    title: specialist ? `${specialist.fullName} — Tiru` : "Specialist — Tiru",
    description: specialist
      ? `${specialist.specialty} at ${specialist.facilityName}, Addis Ababa.`
      : "",
  };
}

export default async function SpecialistDetailRoute({
  params,
}: SpecialistDetailRouteProps) {
  const { slug } = await params;
  const specialist = await getSpecialistBySlug(slug);

  if (!specialist) {
    return (
      <PageShell>
        <PageContainer className="py-16 text-center">
          <p className="text-base leading-7 text-muted-foreground">
            Specialist not found.{" "}
            <Link className="font-semibold text-primary" href="/specialists">
              Browse all specialists &rarr;
            </Link>
          </p>
        </PageContainer>
      </PageShell>
    );
  }

  const allSpecialists = await getAllSpecialists();
  const similarSpecialists = allSpecialists
    .filter(
      (other) =>
        other.id !== specialist.id &&
        other.specialty === specialist.specialty &&
        other.facilitySlug !== specialist.facilitySlug,
    )
    .slice(0, 3);

  return (
    <PageShell>
      <SpecialistDetailPage similarSpecialists={similarSpecialists} specialist={specialist} />
    </PageShell>
  );
}
