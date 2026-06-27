import Link from "next/link";
import { ONBOARDING_STEPS, TOTAL_STEPS } from "@/lib/provider/onboarding-config";

export function OnboardingShell({
  currentStep,
  completionPct,
  children,
}: {
  currentStep: number;
  completionPct: number;
  children: React.ReactNode;
}) {
  const step = ONBOARDING_STEPS.find((s) => s.num === currentStep);

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
              return (
                <Link
                  key={s.num}
                  className={`flex flex-col items-center gap-1 ${
                    s.num <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                  }`}
                  href={s.num <= currentStep ? `/provider/onboarding/${s.slug}` : "#"}
                >
                  <span
                    className={`flex size-7 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isComplete
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isComplete ? "✓" : s.num}
                  </span>
                  <span className="hidden text-[10px] text-muted-foreground sm:block">
                    {s.label.split(" ")[0]}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
