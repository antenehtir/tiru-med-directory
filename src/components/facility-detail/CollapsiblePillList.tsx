"use client";

import { useId, useState } from "react";
import { Pill } from "@/components/ui/Pill";

// A long pill list is not a list any more — it is a wall. Lancet lists 48
// clinical specialties, which pushed everything below it (hours, location,
// trust) off the first two screens on a phone, and nobody reads item 31 of a
// flat run of identical chips anyway.
//
// Collapsed to a readable opening set with the remainder behind a count, the
// same affordance FacilityCard's service row already uses — same words, same
// behaviour, so a visitor who has seen one recognises the other.
const VISIBLE_COUNT = 8;

// Collapsing only earns its place when it hides enough to matter. At a total
// of 10 the control would trade two pills for a button, which is a worse list
// and a bigger tap target for nothing.
const MIN_TOTAL_TO_COLLAPSE = 12;

export function CollapsiblePillList({ items, label }: { items: string[]; label: string }) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();

  if (items.length === 0) return null;

  const collapsible = items.length >= MIN_TOTAL_TO_COLLAPSE;
  const visible = !collapsible || expanded ? items : items.slice(0, VISIBLE_COUNT);
  const hiddenCount = items.length - visible.length;

  return (
    <div>
      <p className="mb-2.5 text-sm font-semibold text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2" id={listId}>
        {visible.map((item) => (
          <Pill key={item} variant="default">
            {item}
          </Pill>
        ))}

        {collapsible ? (
          <button
            aria-controls={listId}
            aria-expanded={expanded}
            className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-3.5 text-sm font-semibold text-primary transition-colors hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            {/* The count is on the expand label, not the collapse one: "+40
                more" answers "is it worth opening?", while after opening the
                reader can see how many there are. */}
            {expanded ? "Show fewer" : `+${hiddenCount} more`}
          </button>
        ) : null}
      </div>
    </div>
  );
}
