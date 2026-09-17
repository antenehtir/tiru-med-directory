import Link from "next/link";
import { AdminNewFacilityForm } from "@/components/admin/AdminNewFacilityForm";

export default function AdminNewFacilityPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          href="/admin/facilities"
        >
          ← Facility Directory
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">New facility</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a listing you have researched yourself. It is saved as a draft
          and listed only when you publish it — as community-sourced, which the
          facility can claim later.
        </p>
      </div>
      <AdminNewFacilityForm />
    </div>
  );
}
