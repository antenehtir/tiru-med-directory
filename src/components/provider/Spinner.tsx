type SpinnerProps = {
  className?: string;
  tone?: "primary" | "on-primary";
};

const toneClasses: Record<NonNullable<SpinnerProps["tone"]>, string> = {
  // Default — for spinners on light/card backgrounds.
  primary: "border-muted border-t-primary",
  // For spinners on solid bg-primary buttons, where the default tone would
  // be invisible/low-contrast against the same teal background.
  "on-primary": "border-primary-foreground/30 border-t-primary-foreground",
};

// Lightweight border-spin indicator — the pattern already established across
// the provider portal (ClaimFacilityForm, MapPinPicker, etc.), extracted so
// every loading state in the portal uses the exact same visual.
export function Spinner({ className = "size-4", tone = "primary" }: SpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 animate-spin rounded-full border-2 ${toneClasses[tone]} ${className}`}
    />
  );
}
