"use client";

import { useId, useState } from "react";
import { Pill } from "@/components/ui/Pill";

type Subgroup = { label: string; services: string[] };

function Chevron({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
    >
      <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

// One panel: its name and how many tests, opening to the tests themselves.
// Closed by default, and each opens independently — choosing "Thyroid" should
// not unfold the other seventeen panels with it.
function LabPanel({ label, services }: Subgroup) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <div className="border-b border-border last:border-0">
      <button
        aria-controls={listId}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-1 text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="min-w-0 text-sm font-medium text-foreground">{label}</span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-muted-foreground">{services.length}</span>
          <Chevron open={open} />
        </span>
      </button>

      {open ? (
        <div className="flex flex-wrap gap-2 px-1 pb-3" id={listId}>
          {services.map((service) => (
            <Pill key={service} variant="default">
              {service}
            </Pill>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// Two levels, because the lab is two levels. BASIC_LAB_CATEGORIES has 18
// panels, and each one used to be a top-level heading with its own pill wall —
// the lab alone was most of the facility page, sitting between "General
// Services" and everything a visitor had scrolled down to find.
//
// Collapsed, the whole lab is one line. Opened, it is a list of panel names,
// which is the level a person actually decides at ("do they do a thyroid
// panel?"). The individual tests are one more tap, for the rarer case of
// checking a specific assay.
export function CollapsibleServiceGroup({
  label,
  subgroups,
}: {
  label: string;
  subgroups: Subgroup[];
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  if (subgroups.length === 0) return null;

  const testCount = subgroups.reduce((total, group) => total + group.services.length, 0);

  return (
    <div>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-card border border-border bg-background px-4 text-left transition-colors hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">{label}</span>
          {/* The counts are the whole reason to open it, or not to. */}
          <span className="block text-xs text-muted-foreground">
            {testCount} {testCount === 1 ? "test" : "tests"} across {subgroups.length}{" "}
            {subgroups.length === 1 ? "panel" : "panels"}
          </span>
        </span>
        <Chevron open={open} />
      </button>

      {open ? (
        <div className="mt-2 rounded-card border border-border" id={panelId}>
          {subgroups.map((group) => (
            <LabPanel key={group.label} label={group.label} services={group.services} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
