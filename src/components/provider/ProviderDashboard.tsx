"use client";

import { useEffect, useState } from "react";
import { calculateCompletion } from "@/lib/provider/onboarding-config";

type ProviderAccount = {
  id: string;
  display_name: string | null;
  facility_name: string | null;
  facility_id: string | null;
  admin_note: string | null;
  onboarding_phase: number | null;
  facilities: { slug: string } | null;
};

type FacilityClaim = Record<string, unknown> & {
  id: string;
  status: string;
  submission_step: number | null;
  submitted_at: string | null;
};

const PHASE_TO_SLUG: Record<number, string> = {
  0: "/provider/onboarding/claim",
  1: "/provider/onboarding/identity",
  2: "/provider/onboarding/location",
  3: "/provider/onboarding/services",
  4: "/provider/onboarding/doctors",
  5: "/provider/onboarding/media",
  6: "/provider/onboarding/review",
};

function continueOnboardingHref(phase: number | null | undefined): string {
  return PHASE_TO_SLUG[phase ?? -1] ?? "/provider/onboarding/identity";
}

function formatDate(value: string | null): string {
  if (!value) return "recently";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ProgressRing({ pct, ringColorClass }: { pct: number; ringColorClass: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const size = 80;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (mounted ? pct / 100 : 0) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="-rotate-90" height={size} width={size}>
        <circle
          className="text-muted"
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
        />
        <circle
          className={`${ringColorClass} transition-[stroke-dashoffset] duration-1000 ease-out`}
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={stroke}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-foreground">{pct}%</span>
      </div>
    </div>
  );
}

function ClipboardIcon() {
  return (
    <svg className="size-10 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <rect height="18" rx="2" ry="2" width="14" x="5" y="3" />
      <path d="M9 3h6v2H9z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="size-10 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "size-10 text-teal-500"} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="size-10 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="size-12 text-teal-500" fill="currentColor" stroke="currentColor" strokeWidth="0.5" viewBox="0 0 24 24">
      <path d="M12 2.5 14.9 9l6.6.6-5 4.4 1.5 6.5L12 17.3 6 20.5l1.5-6.5-5-4.4L9.1 9Z" strokeLinejoin="round" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg className="size-10 text-red-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 9 6 6M15 9l-6 6" strokeLinecap="round" />
    </svg>
  );
}

const QUICK_LINKS = [
  { label: "Edit Basic Info", href: "/provider/onboarding/identity" },
  { label: "Edit Location", href: "/provider/onboarding/location" },
  { label: "Edit Services", href: "/provider/onboarding/services" },
  { label: "Photos & Docs", href: "/provider/onboarding/media" },
];

const COMPLETION_STEPS = [
  { label: "Step 1 Basic Info", weight: 10, doneAt: 2 },
  { label: "Step 2 Location", weight: 30, doneAt: 3 },
  { label: "Step 3 Services", weight: 30, doneAt: 4 },
  { label: "Step 4 Doctors (optional)", weight: 10, doneAt: 5 },
  { label: "Step 5 Photos", weight: 15, doneAt: 6 },
];

export function ProviderDashboard({
  provider,
  claim,
}: {
  provider: ProviderAccount;
  claim: FacilityClaim | null;
}) {
  const submissionStep = (claim?.submission_step as number | null) ?? 0;
  const pct = claim ? calculateCompletion(claim) : 0;
  const facilitySlug = provider.facilities?.slug ?? null;

  const stepChecklist = [
    { label: "Step 1 Basic Info", complete: submissionStep > 1 },
    { label: "Step 2 Location & Contact", complete: submissionStep > 2 },
    { label: "Step 3 Services & Schedule", complete: submissionStep > 3 },
  ];

  const showQuickLinks = claim?.status !== "pending_review" && claim?.status !== "approved";
  const showCompletionBreakdown = Boolean(claim) && claim?.status === "pending";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {provider.display_name ?? "there"}
            </h1>
            <p className="mt-0.5 text-sm font-medium text-teal-600">{provider.facility_name}</p>
          </div>
          <a className="shrink-0 text-sm text-muted-foreground hover:text-foreground" href="/provider/logout">
            Sign out
          </a>
        </div>

        {/* Status card */}
        <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          {!claim && (
            <div className="text-center">
              <div className="flex justify-center"><ClipboardIcon /></div>
              <h2 className="mt-3 text-lg font-bold text-foreground">Start your listing</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You haven&apos;t started your facility listing yet.
              </p>
              <a
                className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                href="/provider/onboarding/identity"
              >
                Begin onboarding →
              </a>
            </div>
          )}

          {claim?.status === "pending" && pct < 70 && (
            <div className="text-center">
              <div className="flex justify-center"><PencilIcon /></div>
              <h2 className="mt-3 text-lg font-bold text-foreground">Your listing is in progress</h2>
              <div className="mt-3 flex justify-center">
                <ProgressRing pct={pct} ringColorClass="text-amber-500" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Complete Steps 1, 2, and 3 to reach 70% and become eligible to submit.
              </p>
              <div className="mt-4 space-y-2 rounded-xl border border-border bg-background p-4 text-left">
                {stepChecklist.map((step) => (
                  <div className="flex items-center gap-2 text-sm" key={step.label}>
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        step.complete ? "bg-teal-500 text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.complete ? "✓" : "·"}
                    </span>
                    <span className={step.complete ? "text-foreground" : "text-muted-foreground"}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              <a
                className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                href={continueOnboardingHref(provider.onboarding_phase)}
              >
                Continue onboarding →
              </a>
            </div>
          )}

          {claim?.status === "pending" && pct >= 70 && (
            <div className="text-center">
              <div className="flex justify-center"><CheckCircleIcon className="size-10 text-teal-500" /></div>
              <h2 className="mt-3 text-lg font-bold text-foreground">Ready to submit!</h2>
              <div className="mt-3 flex justify-center">
                <ProgressRing pct={pct} ringColorClass="text-teal-500" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Your profile is complete enough to submit for review.
              </p>
              <div className="mt-4 flex flex-col items-center gap-2">
                <a
                  className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  href="/provider/onboarding/review"
                >
                  Review and submit →
                </a>
                <a
                  className="text-sm text-muted-foreground hover:text-foreground"
                  href={continueOnboardingHref(provider.onboarding_phase)}
                >
                  Continue editing →
                </a>
              </div>
            </div>
          )}

          {claim?.status === "pending_review" && (
            <div className="text-center">
              <div className="flex justify-center"><ClockIcon /></div>
              <h2 className="mt-3 text-lg font-bold text-foreground">Under review</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Submitted {formatDate(claim.submitted_at)}. An admin will call your facility to
                verify your claim. This usually takes 1–3 business days.
              </p>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-800 dark:bg-amber-950/30">
                You cannot edit your listing while it is under review.
              </div>
              <a
                className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                href="/provider/onboarding/review"
              >
                View submission →
              </a>
            </div>
          )}

          {claim?.status === "approved" && (
            <div className="text-center">
              <div className="flex justify-center"><StarIcon /></div>
              <h2 className="mt-3 text-lg font-bold text-foreground">You&apos;re Official! ✓</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your facility is live on the Tiru Medical Directory with the Official badge.
              </p>
              <div className="mt-4 flex flex-col items-center gap-2">
                <a
                  className="inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  href={facilitySlug ? `/facilities/${facilitySlug}` : "/facilities"}
                >
                  View your listing →
                </a>
                <a
                  className="text-sm text-muted-foreground hover:text-foreground"
                  href="/provider/onboarding/identity"
                >
                  Update your listing →
                </a>
              </div>
            </div>
          )}

          {claim?.status === "rejected" && (
            <div className="text-center">
              <div className="flex justify-center"><XCircleIcon /></div>
              <h2 className="mt-3 text-lg font-bold text-foreground">Listing not approved</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your listing was not approved. Please review the feedback below and resubmit.
              </p>
              {provider.admin_note && (
                <div className="mt-4 rounded-xl border border-border bg-background p-3 text-left text-sm text-foreground">
                  {provider.admin_note}
                </div>
              )}
              <a
                className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                href="/provider/onboarding/identity"
              >
                Edit and resubmit →
              </a>
            </div>
          )}
        </div>

        {/* Quick links */}
        {showQuickLinks && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_LINKS.map((link) => (
              <a
                className="rounded-xl border border-border bg-card p-4 text-center text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Completion breakdown */}
        {showCompletionBreakdown && (
          <div className="mb-6 rounded-2xl border border-border bg-card p-5">
            <p className="mb-3 font-semibold text-foreground">Profile completion</p>
            <div className="space-y-2">
              {COMPLETION_STEPS.map((step) => {
                const complete = submissionStep >= step.doneAt;
                return (
                  <div className="flex items-center justify-between text-sm" key={step.label}>
                    <span className="text-muted-foreground">
                      {step.label} — {step.weight}%
                    </span>
                    <span className={complete ? "font-semibold text-teal-600" : "text-muted-foreground"}>
                      {complete ? "✓" : "pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <a className="text-sm text-muted-foreground hover:text-foreground" href="/contact">
            Need help? Contact us
          </a>
          <p className="mt-2 text-xs text-muted-foreground">Powered by Tiru Medical Directory</p>
        </div>
      </main>
    </div>
  );
}
