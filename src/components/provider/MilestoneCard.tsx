"use client";

import { useEffect, useState } from "react";
import { OFFICIAL_BADGE_THRESHOLD_PCT } from "@/lib/provider/onboarding-config";

type StepChecklistItem = {
  label: string;
  complete: boolean;
};

function ProgressRing({ pct, ringColorClass }: { pct: number; ringColorClass: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const size = 120;
  const stroke = 8;
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
        <span className="text-2xl font-bold text-foreground">{pct}%</span>
        <span className="text-[10px] text-muted-foreground">Profile complete</span>
      </div>
    </div>
  );
}

function CelebrationBurst() {
  return (
    <div className="relative mx-auto flex size-20 items-center justify-center">
      <style>{`
        @keyframes milestone-pop {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes milestone-burst {
          0% { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(1.7); opacity: 0; }
        }
        .milestone-pop { animation: milestone-pop 0.5s ease-out both; }
        .milestone-burst { animation: milestone-burst 0.8s ease-out both; }
      `}</style>
      <span className="milestone-burst absolute inset-0 rounded-full bg-teal-400/40" />
      <span className="milestone-pop relative flex size-16 items-center justify-center rounded-full bg-teal-500 text-3xl text-white shadow-lg">
        ✓
      </span>
    </div>
  );
}

export function MilestoneCard({
  pct,
  status,
  facilitySlug,
  stepChecklist,
}: {
  pct: number;
  status: string;
  facilitySlug: string | null;
  stepChecklist: StepChecklistItem[];
}) {
  const approved = status === "approved";
  const pendingReview = status === "pending_review";
  const eligible = pct >= OFFICIAL_BADGE_THRESHOLD_PCT;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="mx-auto mt-12 max-w-lg rounded-3xl bg-card p-8 shadow-lg">
        {approved ? (
          <div className="space-y-6 text-center">
            <CelebrationBurst />

            <div>
              <h1 className="text-xl font-bold text-foreground">You&apos;re now Official! ✓</h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Your facility has been verified and your Official badge is now live on the
                directory.
              </p>
            </div>

            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1.5 text-sm font-bold text-[#0F766E]">
                ✓ Official
              </span>
            </div>

            <div className="space-y-3">
              <a
                className="block w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                href={facilitySlug ? `/facilities/${facilitySlug}` : "/provider/dashboard"}
              >
                View your listing →
              </a>
              <a
                className="block text-sm text-muted-foreground hover:text-foreground"
                href="/provider/dashboard"
              >
                Go to my dashboard →
              </a>
            </div>
          </div>
        ) : pendingReview ? (
          <div className="space-y-6 text-center">
            <CelebrationBurst />

            <div>
              <h1 className="text-xl font-bold text-foreground">
                Submitted! Your listing is under review.
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                An admin will contact your registered facility number to verify your claim. This
                usually takes 1–3 business days.
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-800">
              You cannot edit your listing while it is under review. Contact us if you need to
              make urgent changes.
            </div>

            <a
              className="block w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              href="/provider/dashboard"
            >
              Go to my dashboard →
            </a>
          </div>
        ) : eligible ? (
          <div className="space-y-6 text-center">
            <CelebrationBurst />

            <div>
              <h1 className="text-xl font-bold text-foreground">
                You&apos;re eligible for the Official badge! 🎉
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Your listing has enough detail to be reviewed for Official verification.
                Once an admin reviews and approves your submission, your facility will
                display the Official badge on the directory.
              </p>
            </div>

            <div className="flex justify-center">
              <ProgressRing pct={pct} ringColorClass="text-teal-500" />
            </div>

            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1.5 text-sm font-bold text-[#0F766E]">
                ✓ Official
              </span>
            </div>

            <div className="rounded-xl border border-border bg-background p-4 text-left">
              <p className="mb-2 text-sm font-semibold text-foreground">What happens next</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li>• An admin will call your registered facility number to verify your claim</li>
                <li>• Your proposed details will be reviewed before going live</li>
                <li>• You&apos;ll be notified once your listing is approved</li>
              </ul>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-sm text-amber-800">
              Complete Steps 4 and 5 to reach 100% and give patients the most complete
              picture of your facility.
            </div>

            <div className="space-y-3">
              <a
                className="block w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                href="/provider/onboarding/doctors"
              >
                Continue to Doctors & Staff →
              </a>
              <a
                className="block text-sm text-muted-foreground hover:text-foreground"
                href="/provider/dashboard"
              >
                Go to my dashboard
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <ProgressRing pct={pct} ringColorClass="text-amber-500" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-foreground">Almost there — keep going</h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Complete Steps 1, 2, and 3 fully to reach the 70% threshold needed for
                Official badge eligibility.
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-background p-4 text-left">
              {stepChecklist.map((step) => (
                <div className="flex items-center gap-2 text-sm" key={step.label}>
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      step.complete
                        ? "bg-teal-500 text-white"
                        : "bg-muted text-muted-foreground"
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
              className="block w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              href="/provider/onboarding/doctors"
            >
              Continue building my profile →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
