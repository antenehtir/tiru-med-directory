import type { Metadata } from "next";
import { Homepage } from "@/components/home/Homepage";
import { PageShell } from "@/components/layout/PageShell";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tiru — Healthcare in Addis Ababa",
  description:
    "Find hospitals, clinics, specialists, diagnostics and pharmacies across Addis Ababa.",
};

export default async function Home() {
  const facilities = await getFacilitiesFromDB();

  return (
    <PageShell>
      <Homepage facilities={facilities} />
    </PageShell>
  );
}
