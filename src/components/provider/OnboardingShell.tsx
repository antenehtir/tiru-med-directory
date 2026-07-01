import Link from "next/link";
import { ONBOARDING_STEPS, TOTAL_STEPS } from "@/lib/provider/onboarding-config";

export function OnboardingShell({
  currentStep,
  completionPct,
  isLiveEdit,
  facilitySlug,
  submissionStep,
  children,
}: {
  currentStep: number;
  completionPct: number;
  isLiveEdit?: boolean;
  facilitySlug?: string;
  submissionStep?: number;
  children: React.ReactNode;
}) {
  const step = ONBOARDING_STEPS.find((s) => s.num === currentStep);
  const prevStep = ONBOARDING_STEPS.find((s) => s.num === currentStep - 1);

  // A dot is accessible if it's been visited (up to max of currentStep or submissionStep),
  // or if the provider is in live-edit mode (approved — can jump to any step).
  const maxAccessible = isLiveEdit
    ? TOTAL_STEPS
    : Math.max(currentStep, submissionStep ?? 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Top bar */}
      <header className="border-b border-border bg-card px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-foreground">Tiru</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              Provider
            </span>
          </div>
          <a
            className="text-sm text-muted-foreground hover:text-foreground"
            href="/provider/logout"
          >
            Sign out
          </a>
        </div>
      </header>

      {isLiveEdit && (
        <div className="flex items-center justify-between border-b border-teal-200 bg-teal-50 px-4 py-2.5 dark:border-teal-800 dark:bg-teal-950/60">
          <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
            Editing live listing — changes go live immediately.
          </p>
          {facilitySlug && (
            <a
              className="ml-4 shrink-0 rounded-lg border border-teal-300 bg-white px-3 py-1 text-xs font-semibold text-teal-700 transition hover:bg-teal-50 dark:border-teal-700 dark:bg-transparent dark:text-teal-300 dark:hover:bg-teal-900/40"
              href={`/facilities/${facilitySlug}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              View live listing ↗
            </a>
          )}
        </div>
      )}

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              Step {currentStep} of {TOTAL_STEPS}: {step?.label}
            </p>
            <p className="text-sm font-bold text-primary">{completionPct}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>

          {/* Step dots */}
          <div className="mt-4 flex items-center justify-between">
            {ONBOARDING_STEPS.map((s) => {
              const isComplete = s.num < currentStep;
              const isCurrent = s.num === currentStep;
              const isAccessible = s.num <= maxAccessible;

              return (
                <div key={s.num} className="flex flex-col items-center gap-1">
                  {isAccessible && !isCurrent ? (
                    <Link
                      className={`flex size-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                        isComplete
                          ? "bg-primary/20 text-primary hover:bg-primary/30 hover:ring-2 hover:ring-primary/40"
                          : "bg-primary/10 text-primary hover:bg-primary/20 hover:ring-2 hover:ring-primary/30"
                      }`}
                      href={`/provider/onboarding/${s.slug}`}
                      title={isComplete ? `Go back to ${s.label}` : s.label}
                    >
                      {isComplete ? "✓" : s.num}
                    </Link>
                  ) : isCurrent ? (
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground ring-2 ring-primary ring-offset-2">
                      {s.num}
                    </span>
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground opacity-40">
                      {s.num}
                    </span>
                  )}
                  <span className="hidden text-[10px] text-muted-foreground sm:block">
                    {s.label.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back link — shown on steps 2+ */}
        {prevStep && (
          <div className="mb-4">
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              href={`/provider/onboarding/${prevStep.slug}`}
            >
              ← Back to {prevStep.label}
            </Link>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
