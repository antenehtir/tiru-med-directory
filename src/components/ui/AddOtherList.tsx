"use client";

import { useId, useState } from "react";

// "Add your own" beside a fixed list of choices: a text box with an Add
// button (Enter works too), and each added value shown as a chip with a ×
// to remove it. Used wherever a list can't cover everything — languages,
// patient groups, insurers.
//
// Typing a value that already exists in knownOptions (any casing) ticks
// that option instead of adding a look-alike duplicate.
export function AddOtherList({
  label,
  placeholder,
  values,
  knownOptions = [],
  onAdd,
  onRemove,
}: {
  label: string;
  placeholder: string;
  // The added values only — not the ticked fixed options.
  values: string[];
  knownOptions?: readonly string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const inputId = useId();
  const [draft, setDraft] = useState("");

  function add() {
    const value = draft.trim().replace(/\s+/g, " ");
    if (!value) return;
    const known = knownOptions.find((o) => o.toLowerCase() === value.toLowerCase());
    const existing = values.find((v) => v.toLowerCase() === value.toLowerCase());
    if (!existing) onAdd(known ?? value);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground" htmlFor={inputId}>
        {label}
      </label>
      <div className="flex gap-2">
        <input
          className="min-h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          id={inputId}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          type="text"
          value={draft}
        />
        <button
          className="min-h-10 shrink-0 rounded-lg border border-primary/40 bg-card px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
          disabled={!draft.trim()}
          onClick={add}
          type="button"
        >
          Add
        </button>
      </div>
      {values.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {values.map((value) => (
            <li
              className="inline-flex items-center gap-1 rounded-full bg-primary py-1 pl-3 pr-1 text-sm font-medium text-primary-foreground"
              key={value}
            >
              {value}
              <button
                aria-label={`Remove ${value}`}
                className="flex size-6 items-center justify-center rounded-full text-base leading-none hover:bg-white/20"
                onClick={() => onRemove(value)}
                type="button"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
