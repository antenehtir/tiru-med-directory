import Link from "next/link";
import { ONBOARDING_STEPS, TOTAL_STEPS } from "@/lib/provider/onboarding-config";

export function OnboardingShell({
  currentStep,
  completionPct,
  isLiveEdit,
  children,
}: {
  currentStep: number;
  completionPct: number;
  isLiveEdit?: boolean;
  children: React.ReactNode;
}) {
  const step = ONBOARDING_STEPS.find((s) => s.num === currentStep);
  const prevStep = ONBOARDING_STEPS.find((s) => s.num === currentStep - 1);

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
        <div className="border-b border-teal-200 bg-teal-50 px-4 py-2.5 text-center text-sm font-medium text-teal-800 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
          Editing live listing — changes go live immediately.
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
              const isAccessible = s.num <= currentStep;

              return (
                <div key={s.num} className="flex flex-col items-center gap-1">
                  {isAccessible ? (
                    <Link
                      className={`flex size-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                          : isComplete
                            ? "bg-primary/20 text-primary hover:bg-primary/30"
                            : "bg-muted text-muted-foreground"
                      }`}
                      href={`/provider/onboarding/${s.slug}`}
                      title={isComplete ? `Go back to ${s.label}` : s.label}
                    >
                      {isComplete ? "✓" : s.num}
                    </Link>
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
