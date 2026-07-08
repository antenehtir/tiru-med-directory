import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { SpecialistsPage } from "@/components/specialists/SpecialistsPage";
import { getAllSpecialists } from "@/lib/supabase/get-specialists";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Specialists — Tiru",
  description: "Find specialists and physicians across Addis Ababa.",
};

export default async function SpecialistsRoute() {
  const specialists = await getAllSpecialists();

  return (
    <PageShell>
      <SpecialistsPage specialists={specialists} />
    </PageShell>
  );
}
