"use client";

import { useEffect, useRef } from "react";
import { getPillClassName, Pill } from "@/components/ui/Pill";
import { BASIC_LAB_CATEGORIES } from "@/lib/provider/onboarding-config";

// Shared pill-selector UI — header with Select all/Deselect all, pill grid,
// and the "Add service not listed" custom free-fill input. Extracted out of
// Step3ServicesForm (provider onboarding) so the admin facility editor can
// reuse the exact same presentational piece instead of re-implementing it —
// this component has no coupling to facility_claims or completion tracking,
// it only takes flat props.
export function PillSelector({
  title,
  options,
  services,
  onToggle,
  onSelectAll,
  customValue,
  onCustomChange,
  onCustomAdd,
  customEntries = [],
  onRemoveCustom,
}: {
  title: string;
  options: readonly string[];
  services: string[];
  onToggle: (item: string) => void;
  onSelectAll: () => void;
  customValue: string;
  onCustomChange: (value: string) => void;
  onCustomAdd: () => void;
  customEntries?: string[];
  onRemoveCustom?: (value: string) => void;
}) {
  const allSelected = options.every((o) => services.includes(o));

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <button
          className="text-xs text-primary hover:underline"
          onClick={onSelectAll}
          type="button"
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Pill
            key={opt}
            onClick={() => onToggle(opt)}
            variant={services.includes(opt) ? "selected" : "default"}
          >
            {opt}
          </Pill>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onCustomAdd();
            }
          }}
          placeholder="Add a service not listed..."
          type="text"
          value={customValue}
        />
        <button
          className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
          disabled={!customValue.trim() || services.includes(customValue.trim())}
          onClick={onCustomAdd}
          type="button"
        >
          Add
        </button>
      </div>

      {customEntries.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {customEntries.map((custom) => (
            <span className={getPillClassName("selected", "md")} key={custom}>
              {custom}
              <button onClick={() => onRemoveCustom?.(custom)} type="button">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// One parent category card within the Basic Lab section — a category-level
// toggle that selects/deselects all its child tests at once, plus individual
// deselectable pills once the category has at least one test selected.
export function BasicLabCategoryCard({
  category,
  tests,
  services,
  onToggleTest,
  onCategoryToggle,
  customValue,
  onCustomChange,
  onCustomAdd,
  customEntries = [],
  onRemoveCustom,
}: {
  category: string;
  tests: string[];
  services: string[];
  onToggleTest: (item: string) => void;
  onCategoryToggle: () => void;
  customValue: string;
  onCustomChange: (value: string) => void;
  onCustomAdd: () => void;
  customEntries?: string[];
  onRemoveCustom?: (value: string) => void;
}) {
  const allSelected = tests.every((t) => services.includes(t));
  const someSelected = !allSelected && tests.some((t) => services.includes(t));
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = someSelected;
  }, [someSelected]);

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <label className="flex cursor-pointer items-center gap-2">
        <input
          checked={allSelected}
          onChange={onCategoryToggle}
          ref={checkboxRef}
          type="checkbox"
        />
        <span className="text-sm font-semibold text-foreground">{category}</span>
      </label>

      {(allSelected || someSelected) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tests.map((test) => (
            <Pill
              key={test}
              onClick={() => onToggleTest(test)}
              variant={services.includes(test) ? "selected" : "default"}
            >
              {test}
            </Pill>
          ))}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onCustomAdd();
            }
          }}
          placeholder={`Add other ${category} test...`}
          type="text"
          value={customValue}
        />
        <button
          className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
          disabled={!customValue.trim() || services.includes(customValue.trim())}
          onClick={onCustomAdd}
          type="button"
        >
          Add
        </button>
      </div>

      {customEntries.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {customEntries.map((custom) => (
            <span className={getPillClassName("selected", "md")} key={custom}>
              {custom}
              <button onClick={() => onRemoveCustom?.(custom)} type="button">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export type CustomServiceCategories = Record<string, string[]>;

// Basic Lab / Point-of-care Testing — hierarchical parent-category structure.
// Each category selects/deselects its own children as a block; individual
// tests can still be deselected one at a time. All selections (predefined and
// custom) flow into the same flat `services` array as every other section.
export function BasicLabSelector({
  services,
  onToggleTest,
  onSelectAllIn,
  customInputs,
  onCustomChange,
  onCustomAdd,
  customServiceCategories,
  onRemoveCustom,
}: {
  services: string[];
  onToggleTest: (item: string) => void;
  onSelectAllIn: (list: readonly string[]) => void;
  customInputs: Record<string, string>;
  onCustomChange: (key: string, value: string) => void;
  onCustomAdd: (key: string) => void;
  customServiceCategories: CustomServiceCategories;
  onRemoveCustom: (key: string, value: string) => void;
}) {
  const otherKey = "basiclab-other-test";

  return (
    <div className="mb-5">
      <p className="mb-1 text-sm font-semibold text-foreground">
        Basic Lab / Point-of-care Testing
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        Select each category your facility offers — this selects all its tests. Deselect any
        individual test you don&apos;t offer.
      </p>

      <div className="space-y-3">
        {Object.entries(BASIC_LAB_CATEGORIES).map(([category, tests]) => {
          const key = `basiclab-${category}`;
          return (
            <BasicLabCategoryCard
              category={category}
              customEntries={customServiceCategories[key] ?? []}
              customValue={customInputs[key] ?? ""}
              key={category}
              onCategoryToggle={() => onSelectAllIn(tests)}
              onCustomAdd={() => onCustomAdd(key)}
              onCustomChange={(v) => onCustomChange(key, v)}
              onRemoveCustom={(v) => onRemoveCustom(key, v)}
              onToggleTest={onToggleTest}
              services={services}
              tests={tests}
            />
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border border-dashed border-border bg-background p-4">
        <p className="mb-2 text-sm font-semibold text-foreground">Other test not listed</p>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onChange={(e) => onCustomChange(otherKey, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onCustomAdd(otherKey);
              }
            }}
            placeholder="Add a test that doesn't fit any category above..."
            type="text"
            value={customInputs[otherKey] ?? ""}
          />
          <button
            className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
            disabled={
              !(customInputs[otherKey] ?? "").trim() ||
              services.includes((customInputs[otherKey] ?? "").trim())
            }
            onClick={() => onCustomAdd(otherKey)}
            type="button"
          >
            Add
          </button>
        </div>

        {(customServiceCategories[otherKey] ?? []).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {(customServiceCategories[otherKey] ?? []).map((custom) => (
              <span className={getPillClassName("selected", "md")} key={custom}>
                {custom}
                <button onClick={() => onRemoveCustom(otherKey, custom)} type="button">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
