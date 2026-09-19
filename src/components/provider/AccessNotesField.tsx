"use client";

import { useId, useState } from "react";
import {
  ACCESS_FEATURES,
  formatAccessNotes,
  parseAccessNotes,
  type AccessNotesParts,
} from "@/lib/provider/access-notes";

// Access notes as a tick-several dropdown plus optional directions. Shared by
// the onboarding wizard and the live facility editor. It works on the one
// stored line of text (see lib/provider/access-notes.ts): the initial value
// in, onChange(nextText) out, and name adds a hidden field for plain forms.
// The ticks and the directions are held here while editing, so typing a
// space at the end of the directions is not trimmed away mid-word.
export function AccessNotesField({
  value,
  onChange,
  onCommit,
  name,
}: {
  value: string;
  onChange: (text: string) => void;
  // Called when a change is finished — a tick, or leaving the directions box
  // — for callers that save as the provider goes.
  onCommit?: (text: string) => void;
  name?: string;
}) {
  const panelId = useId();
  const directionsId = useId();
  const [open, setOpen] = useState(false);
  const [parts, setParts] = useState<AccessNotesParts>(() => parseAccessNotes(value));

  function update(next: AccessNotesParts, commit: boolean) {
    setParts(next);
    const text = formatAccessNotes(next);
    onChange(text);
    if (commit) onCommit?.(text);
  }

  function toggle(feature: string) {
    const features = parts.features.includes(feature)
      ? parts.features.filter((f) => f !== feature)
      : [...parts.features, feature];
    update({ ...parts, features }, true);
  }

  const summary =
    parts.features.length === 0
      ? "Choose what applies"
      : parts.features.length === 1
        ? parts.features[0]
        : `${parts.features.length} selected`;

  return (
    <div className="flex flex-col gap-2">
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="flex min-h-10 w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 text-left text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        <span className={parts.features.length === 0 ? "text-muted-foreground" : ""}>{summary}</span>
        <svg
          aria-hidden="true"
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>

      {open && (
        <fieldset className="rounded-lg border border-border bg-background p-2" id={panelId}>
          <legend className="sr-only">Access features</legend>
          {ACCESS_FEATURES.map((feature) => (
            <label
              className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-2 text-sm text-foreground hover:bg-muted"
              key={feature}
            >
              <input
                checked={parts.features.includes(feature)}
                className="size-4 accent-[var(--primary)]"
                onChange={() => toggle(feature)}
                type="checkbox"
              />
              {feature}
            </label>
          ))}
        </fieldset>
      )}

      {!open && parts.features.length > 1 && (
        <p className="text-xs text-muted-foreground">{parts.features.join(" · ")}</p>
      )}

      <label className="text-xs font-medium text-muted-foreground" htmlFor={directionsId}>
        Entrance directions (optional)
      </label>
      <input
        className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        id={directionsId}
        onBlur={() => onCommit?.(formatAccessNotes(parts))}
        onChange={(e) => update({ ...parts, directions: e.target.value }, false)}
        placeholder="e.g. Enter via the rear gate, 2nd floor"
        type="text"
        value={parts.directions}
      />

      {name && <input name={name} type="hidden" value={formatAccessNotes(parts)} />}
    </div>
  );
}
