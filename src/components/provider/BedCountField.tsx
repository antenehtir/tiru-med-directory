"use client";

import { useId, useState } from "react";

export const INPATIENT_SERVICE = "Inpatient admission";
const MAX_BEDS = 5000;

// "How many beds?" — shown only while "Inpatient admission" is ticked, in
// the onboarding wizard and the facility editor. Blank means not stated.
// Kept as text while typing so a half-typed or cleared box does not jump to
// a number; the parsed value goes out on each change.
export function BedCountField({
  value,
  onChange,
  onCommit,
}: {
  value: number | null;
  onChange: (beds: number | null) => void;
  // Called when the box is left — for callers that save as the provider goes.
  onCommit?: (beds: number | null) => void;
}) {
  const id = useId();
  const [text, setText] = useState(value ? String(value) : "");
  const parsed = text.trim() === "" ? null : Number(text);
  const invalid = parsed !== null && (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_BEDS);

  return (
    <div className="mb-5 flex flex-col gap-1.5 rounded-xl border border-dashed border-primary/30 bg-card p-3">
      <label className="text-sm font-medium text-foreground" htmlFor={id}>
        Number of inpatient beds (optional)
      </label>
      <input
        aria-invalid={invalid}
        className="min-h-10 w-40 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        id={id}
        inputMode="numeric"
        max={MAX_BEDS}
        min={1}
        onBlur={() => {
          if (!invalid) onCommit?.(parsed);
        }}
        onChange={(e) => {
          const next = e.target.value.replace(/[^\d]/g, "");
          setText(next);
          const n = next === "" ? null : Number(next);
          if (n === null || (n >= 1 && n <= MAX_BEDS)) onChange(n);
        }}
        placeholder="e.g. 40"
        type="text"
        value={text}
      />
      <p className={`text-xs ${invalid ? "text-error" : "text-muted-foreground"}`}>
        {invalid ? `Enter a number between 1 and ${MAX_BEDS}.` : "Shown on your listing, next to inpatient admission."}
      </p>
    </div>
  );
}
