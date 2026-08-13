import type { BadgeVariant } from "@/lib/design-tokens";

// Computed at read time from expiry_date — never stored as a column, so it
// can never go stale relative to "today". Every admin surface that shows a
// license status (claims review cards, Facility Directory, dashboard stat,
// Compliance view) goes through this one module so they can't disagree.
export type LicenseStatus = "missing" | "expired" | "expiring-soon" | "expiring" | "valid";

export const LICENSE_STATUS_LABELS: Record<LicenseStatus, string> = {
  missing: "Missing",
  expired: "Expired",
  "expiring-soon": "Expiring soon",
  expiring: "Expiring",
  valid: "Valid",
};

// No dedicated "urgent" pill variant exists (Badge/Pill only have
// default/muted/warning/danger/success/info) — expiring-soon (≤30 days)
// folds into danger ("act now"), matching the closest existing semantic
// per src/lib/design-tokens.ts's own danger-usage guidance.
export const LICENSE_STATUS_VARIANT: Record<LicenseStatus, BadgeVariant> = {
  missing: "muted",
  expired: "danger",
  "expiring-soon": "danger",
  expiring: "warning",
  valid: "success",
};

// Lower = more urgent. Used to pick the worse of two licenses (Facility
// Directory's single License column) and to sort the Compliance view.
const SEVERITY: Record<LicenseStatus, number> = {
  expired: 0,
  missing: 1,
  "expiring-soon": 2,
  expiring: 3,
  valid: 4,
};

export function getLicenseStatus(
  url: string | null | undefined,
  expiryDate: string | null | undefined,
): LicenseStatus {
  if (!url) return "missing";
  // A document with no recorded expiry can't be assessed for risk — treated
  // as missing (incomplete record) rather than assumed valid. Relevant for
  // any pre-licensing-gate record that has a URL but no dates.
  if (!expiryDate) return "missing";

  const expiry = new Date(`${expiryDate}T00:00:00`);
  if (Number.isNaN(expiry.getTime())) return "missing";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "expiring-soon";
  if (diffDays <= 60) return "expiring";
  return "valid";
}

export function worstLicenseStatus(a: LicenseStatus, b: LicenseStatus): LicenseStatus {
  return SEVERITY[a] <= SEVERITY[b] ? a : b;
}

export function licenseStatusNeedsAttention(status: LicenseStatus): boolean {
  return status === "expired" || status === "missing";
}

export type LicenseDoc = {
  url: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  status: LicenseStatus;
};

export type FacilityLicenseInfo = {
  operating: LicenseDoc;
  business: LicenseDoc;
  worst: LicenseStatus;
};

export type LicenseClaimRow = {
  proposed_license_url?: string | null;
  proposed_license_issue_date?: string | null;
  proposed_license_expiry_date?: string | null;
  proposed_business_license_url?: string | null;
  proposed_business_license_issue_date?: string | null;
  proposed_business_license_expiry_date?: string | null;
};

export function computeFacilityLicenseInfo(claim: LicenseClaimRow | null | undefined): FacilityLicenseInfo {
  const operatingStatus = getLicenseStatus(claim?.proposed_license_url, claim?.proposed_license_expiry_date);
  const businessStatus = getLicenseStatus(
    claim?.proposed_business_license_url,
    claim?.proposed_business_license_expiry_date,
  );

  return {
    operating: {
      url: claim?.proposed_license_url ?? null,
      issueDate: claim?.proposed_license_issue_date ?? null,
      expiryDate: claim?.proposed_license_expiry_date ?? null,
      status: operatingStatus,
    },
    business: {
      url: claim?.proposed_business_license_url ?? null,
      issueDate: claim?.proposed_business_license_issue_date ?? null,
      expiryDate: claim?.proposed_business_license_expiry_date ?? null,
      status: businessStatus,
    },
    worst: worstLicenseStatus(operatingStatus, businessStatus),
  };
}
