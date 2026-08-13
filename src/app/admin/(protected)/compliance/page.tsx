import Link from "next/link";
import { getFacilitiesWithLicenseIssues } from "@/lib/admin/facility-licenses";
import { LicenseStatusBadge } from "@/components/admin/LicenseStatusBadge";
import { LicenseDocumentLink } from "@/components/admin/LicenseDocumentLink";

export default async function AdminCompliancePage() {
  const facilities = await getFacilitiesWithLicenseIssues();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Compliance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Active facilities with an Expired or Missing license, sorted by soonest expiry.
          Nothing here is auto-deactivated — this is a review queue, not an enforcement action.
        </p>
      </div>

      {facilities.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-lg font-semibold text-foreground">No license issues</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Every active facility has a valid or soon-to-expire license on file.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Facility</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Location</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Operating license</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Business license</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {facilities.map((facility) => (
                <tr className="border-b border-border last:border-0 hover:bg-muted/20" key={facility.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{facility.name}</div>
                    <div className="text-xs text-muted-foreground">{facility.category}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {[facility.area, facility.sub_city].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <LicenseStatusBadge status={facility.licenseInfo.operating.status} />
                    <div className="mt-1">
                      <LicenseDocumentLink url={facility.licenseInfo.operating.url} />
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Expires: {facility.licenseInfo.operating.expiryDate ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <LicenseStatusBadge status={facility.licenseInfo.business.status} />
                    <div className="mt-1">
                      <LicenseDocumentLink url={facility.licenseInfo.business.url} />
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Expires: {facility.licenseInfo.business.expiryDate ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <LicenseStatusBadge status={facility.licenseInfo.worst} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      className="text-xs text-primary hover:underline"
                      href={`/admin/facilities?license=${facility.licenseInfo.worst}`}
                    >
                      View in directory →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
