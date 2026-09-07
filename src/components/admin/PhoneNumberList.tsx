"use client";

import { useState } from "react";

// A facility can have as many numbers as it has. The database has held exactly
// two — phone and phone_2 — and 94 of 106 rows already use both, which is what
// a ceiling looks like from underneath: not "two is enough" but "two is all we
// asked for". Reception, emergency, and the branch line are three, and that is
// an ordinary clinic.
//
// The list posts one newline-separated value under `name`, so a caller needs no
// per-row field wiring. Order is meaningful and preserved: the first number is
// the one a patient should try first, and it is the one that keeps filling the
// existing `phone` column.
export function PhoneNumberList({
  name,
  label,
  help,
  initial = [],
  onChange,
}: {
  name: string;
  label: string;
  help?: string;
  initial?: string[];
  // Fires with the non-blank numbers whenever they change. The create form
  // posts through the hidden field below and needs none of this; the admin
  // editor is not a form — it diffs state against a snapshot behind its own
  // Save button — so it takes the value this way instead.
  onChange?: (numbers: string[]) => void;
}) {
  // Always at least one row, so the control never renders as an empty box with
  // an Add button and no obvious starting point.
  const [numbers, setNumbers] = useState<string[]>(initial.length ? initial : [""]);

  function apply(next: string[]) {
    setNumbers(next);
    onChange?.(next.map((n) => n.trim()).filter(Boolean));
  }

  function update(index: number, value: string) {
    apply(numbers.map((n, i) => (i === index ? value : n)));
  }

  function add() {
    apply([...numbers, ""]);
  }

  function remove(index: number) {
    apply(numbers.length === 1 ? [""] : numbers.filter((_, i) => i !== index));
  }

  const kept = numbers.map((n) => n.trim()).filter(Boolean);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-foreground" htmlFor={`${name}-0`}>
          {label}
        </label>
        <button
          className="shrink-0 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
          onClick={add}
          type="button"
        >
          + Add number
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {numbers.map((value, index) => (
          <div className="flex items-center gap-2" key={index}>
            <input
              className="min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              id={`${name}-${index}`}
              onChange={(e) => update(index, e.target.value)}
              placeholder={index === 0 ? "+251 ..." : "Another number"}
              type="tel"
              value={value}
            />
            {numbers.length > 1 && (
              <button
                aria-label={`Remove number ${index + 1}`}
                className="shrink-0 rounded-lg border border-border px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:border-strong-border hover:text-foreground"
                onClick={() => remove(index)}
                type="button"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* One field, newline separated. Blank rows are dropped here rather than
          on the server, so what posts is what the person can see they typed. */}
      <input name={name} type="hidden" value={kept.join("\n")} />

      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}
