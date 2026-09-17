"use client";

import { useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type FacilityEditorSection = {
  key: string;
  label: string;
  // A render function rather than an element, so only the open section is
  // ever mounted — each one carries its own unsaved state and some (the map)
  // are heavy.
  render: () => ReactNode;
};

// The tab bar of the live facility editor, shared by the admin editor and a
// verified provider's own listing editor. Sectioned, not a sequential
// wizard: whoever is editing lands on the section the URL names
// (?section=, so a link can point straight at one) and moves between them
// freely. Sections know nothing about each other — no shared completion
// state, no "continue" gate.
export function FacilityEditorTabs({ sections }: { sections: FacilityEditorSection[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const param = searchParams.get("section");
  const initial = sections.some((s) => s.key === param) ? (param as string) : sections[0]?.key;
  const [current, setCurrent] = useState(initial);

  function select(next: string) {
    setCurrent(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", next);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  const active = sections.find((s) => s.key === current) ?? sections[0];

  return (
    <div>
      {/* Scrolls sideways rather than wrapping: eight sections do not fit a
          phone, and a wrapped tab bar reads as two unrelated rows. */}
      <div className="-mx-4 mb-6 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-1" role="tablist">
          {sections.map((section) => (
            <button
              aria-selected={section.key === active?.key}
              className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold transition ${
                section.key === active?.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              key={section.key}
              onClick={() => select(section.key)}
              role="tab"
              type="button"
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {active?.render()}
    </div>
  );
}
