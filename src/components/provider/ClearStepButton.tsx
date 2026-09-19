"use client";

import { useState, useTransition } from "react";
import {
  clearOnboardingStep,
  type OnboardingStepKey,
} from "@/app/provider/(console)/onboarding/clear-step-actions";

// "Clear entries" for one onboarding step: asks first, empties the step's
// saved answers, then reloads so every field on the page shows the empty
// draft (the forms start from what was saved, so a reload is what resets
// them all at once).
export function ClearStepButton({ step }: { step: OnboardingStepKey }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function clear() {
    if (!window.confirm("Clear everything entered on this step? This can't be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await clearOnboardingStep(step);
      if (result.ok) window.location.reload();
      else setError(result.error);
    });
  }

  return (
    <span className="inline-flex flex-col items-start">
      <button
        className="min-h-11 rounded-lg px-3 text-sm font-medium text-muted-foreground underline-offset-2 transition hover:text-error hover:underline disabled:opacity-50"
        disabled={isPending}
        onClick={clear}
        type="button"
      >
        {isPending ? "Clearing…" : "Clear entries"}
      </button>
      {error && (
        <span className="px-3 text-xs text-error" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
