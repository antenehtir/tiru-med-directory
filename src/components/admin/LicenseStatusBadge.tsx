import { Badge } from "@/components/ui/Badge";
import { LICENSE_STATUS_LABELS, LICENSE_STATUS_VARIANT, type LicenseStatus } from "@/lib/licenses/license-status";

export function LicenseStatusBadge({ status, size = "sm" }: { status: LicenseStatus; size?: "sm" | "md" }) {
  return (
    <Badge size={size} variant={LICENSE_STATUS_VARIANT[status]}>
      {LICENSE_STATUS_LABELS[status]}
    </Badge>
  );
}
