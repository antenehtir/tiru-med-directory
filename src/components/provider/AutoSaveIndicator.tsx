import { Spinner } from "./Spinner";

type AutoSaveIndicatorProps = {
  isPending: boolean;
  lastSaved: Date | null;
  className?: string;
};

// Single shared auto-save status line used by every onboarding step —
// replaces the per-step "Draft saved {time}" / "Saving…" pairs that had
// drifted into different wording, placement, and markup across steps.
export function AutoSaveIndicator({
  isPending,
  lastSaved,
  className = "",
}: AutoSaveIndicatorProps) {
  if (!isPending && !lastSaved) {
    return null;
  }

  return (
    <p
      className={`flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground ${className}`}
    >
      {isPending ? (
        <>
          <Spinner className="size-3" />
          Saving…
        </>
      ) : (
        lastSaved && (
          <>
            <span className="size-1.5 shrink-0 rounded-full bg-success" />
            Draft saved {lastSaved.toLocaleTimeString()}
          </>
        )
      )}
    </p>
  );
}
