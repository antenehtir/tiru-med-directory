import type { Metadata } from "next";
import { Homepage } from "@/components/home/Homepage";
import { PageShell } from "@/components/layout/PageShell";
import { getFacilitiesFromDB } from "@/lib/supabase/get-facilities";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tiru Health — Healthcare in Addis Ababa",
  description:
    "Search hospitals, specialty centres and diagnostic labs across Addis Ababa, or find the care closest to you.",
};

const NEW_ON_TIRU_COUNT = 4;

export default async function Home() {
  const facilities = await getFacilitiesFromDB();

  // The stat strip's "Healthcare listings": the active listings this page
  // actually loaded, counted live rather than written into the copy.
  const listingCount = facilities.length;

  // "New on Tiru": the most recently created listings that are live. The
  // query already returns active rows only; drafts are excluded again here so
  // an unpublished admin draft can never be featured, even if that changes.
  // Rows without a created date can't be ranked, so they are left out rather
  // than guessed at.
  const newFacilities = facilities
    .filter((facility) => facility.isActive !== false && !facility.isDraft && facility.createdAt)
    .sort((a, b) => Date.parse(b.createdAt!) - Date.parse(a.createdAt!))
    .slice(0, NEW_ON_TIRU_COUNT);

  return (
    <PageShell homepage>
      <Homepage facilities={facilities} listingCount={listingCount} newFacilities={newFacilities} />
    </PageShell>
  );
}
