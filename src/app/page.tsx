import type { Metadata } from "next";
import { Homepage } from "@/components/home/Homepage";
import { PageShell } from "@/components/layout/PageShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tiru — Healthcare in Addis Ababa",
  description:
    "Find hospitals, clinics, specialists, diagnostics and pharmacies across Addis Ababa.",
};

export default function Home() {
  return (
    <PageShell>
      <Homepage />
    </PageShell>
  );
}
