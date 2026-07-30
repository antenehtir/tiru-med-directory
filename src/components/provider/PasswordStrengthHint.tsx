type Strength = "weak" | "medium" | "strong";

function getStrength(password: string): Strength | null {
  if (!password) return null;
  if (password.length < 8) return "weak";

  let variety = 0;
  if (/[a-z]/.test(password)) variety += 1;
  if (/[A-Z]/.test(password)) variety += 1;
  if (/[0-9]/.test(password)) variety += 1;
  if (/[^a-zA-Z0-9]/.test(password)) variety += 1;

  if (password.length >= 12 && variety >= 3) return "strong";
  if (password.length >= 8 && variety >= 2) return "medium";
  return "weak";
}

const STRENGTH_LABEL: Record<Strength, string> = {
  weak: "Weak",
  medium: "Medium",
  strong: "Strong",
};

const STRENGTH_BAR_CLASS: Record<Strength, string> = {
  weak: "w-1/3 bg-red-500",
  medium: "w-2/3 bg-amber-500",
  strong: "w-full bg-success",
};

const STRENGTH_TEXT_CLASS: Record<Strength, string> = {
  weak: "text-red-600 dark:text-red-400",
  medium: "text-amber-600 dark:text-amber-400",
  strong: "text-success-text",
};

// Subtle, non-blocking strength indicator — length + character variety only,
// purely informational (does not gate submission).
export function PasswordStrengthHint({ password }: { password: string }) {
  const strength = getStrength(password);
  if (!strength) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${STRENGTH_BAR_CLASS[strength]}`}
        />
      </div>
      <span className={`text-xs font-medium ${STRENGTH_TEXT_CLASS[strength]}`}>
        {STRENGTH_LABEL[strength]}
      </span>
    </div>
  );
}
