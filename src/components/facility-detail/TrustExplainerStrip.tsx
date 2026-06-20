import type { SVGProps } from "react";
import type { VerificationStatus } from "@/types/verification";

function InfoCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

type TrustExplainerStripProps = {
  status: VerificationStatus;
};

export function TrustExplainerStrip({ status }: TrustExplainerStripProps) {
  if (status === "verified") {
    return (
      <p className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
        <CheckCircleIcon className="size-3.5 shrink-0" />
        Verified &mdash; confirmed accurate by the Tiru team.
      </p>
    );
  }

  if (status === "community-submitted") {
    return (
      <p className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
        <InfoCircleIcon className="size-3.5 shrink-0" />
        Community submitted &mdash; added by a user or the provider, pending
        full verification.
      </p>
    );
  }

  return null;
}
