"use client";

import { useId, useState } from "react";
import { getPillClassName, Pill } from "@/components/ui/Pill";
import { ALL_BASIC_LAB_TESTS, BASIC_LAB_CATEGORIES } from "@/lib/provider/onboarding-config";

// Case-insensitive exact match against a catalogue list, returning the
// list's own spelling (not the typed one) so a match ticks the real pill
// rather than adding a differently-cased duplicate. Typing "dialysis" and
// picking the suggestion should tick "Dialysis", not add a second, lower-case
// "dialysis" chip next to it.
function findKnownMatch(input: string, options: readonly string[]): string | undefined {
  const needle = input.trim().toLowerCase();
  if (!needle) return undefined;
  return options.find((o) => o.toLowerCase() === needle);
}

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
  const datalistId = useId();
  // A typed value that already names a catalogue entry ticks that pill
  // instead of filing a duplicate free-text chip — the point of the
  // datalist is to let someone find and select the real entry rather than
  // re-typing it as a new one.
  const knownMatch = findKnownMatch(customValue, options);
  const submit = () => (knownMatch ? onToggle(knownMatch) : onCustomAdd());

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
          list={datalistId}
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Add a service not listed, or search the list above..."
          type="text"
          value={customValue}
        />
        <datalist id={datalistId}>
          {options.map((opt) => (
            <option key={opt} value={opt} />
          ))}
        </datalist>
        <button
          className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
          disabled={
            !customValue.trim() ||
            (knownMatch ? services.includes(knownMatch) : services.includes(customValue.trim()))
          }
          onClick={submit}
          type="button"
        >
          {knownMatch && services.includes(knownMatch) ? "Already added" : "Add"}
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

// One panel within the Basic Lab section: its tests always visible, each
// selectable on its own, with Select all / Clear all as a separate action.
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
  const selectedCount = tests.filter((t) => services.includes(t)).length;
  const datalistId = useId();
  // Matched against every lab test, not just this panel's: a test typed here
  // that actually lives in a different panel should still tick the real
  // entry there rather than file a duplicate under this one.
  const knownMatch = findKnownMatch(customValue, ALL_BASIC_LAB_TESTS);
  const submit = () => (knownMatch ? onToggleTest(knownMatch) : onCustomAdd());

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      {/* The tests are always on screen, and the panel heading is no longer a
          checkbox. It used to be one, and ticking it selected all of its tests
          — which meant the only way to see what a panel contained was to claim
          the facility ran every test in it, then untick back down. Nobody
          should have to answer a question to find out what the question was.

          So: the list is visible from the start, each pill toggles on its own,
          and selecting the whole panel is an explicit action sitting beside a
          count of what is already chosen. */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{category}</p>
          <p className="text-xs text-muted-foreground">
            {selectedCount > 0
              ? `${selectedCount} of ${tests.length} selected`
              : `${tests.length} tests — tap any that apply`}
          </p>
        </div>
        <button
          className="shrink-0 rounded-lg border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10"
          onClick={onCategoryToggle}
          type="button"
        >
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>

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

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          list={datalistId}
          onChange={(e) => onCustomChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={`Add other ${category} test, or search all tests...`}
          type="text"
          value={customValue}
        />
        <datalist id={datalistId}>
          {ALL_BASIC_LAB_TESTS.map((test) => (
            <option key={test} value={test} />
          ))}
        </datalist>
        <button
          className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
          disabled={
            !customValue.trim() ||
            (knownMatch ? services.includes(knownMatch) : services.includes(customValue.trim()))
          }
          onClick={submit}
          type="button"
        >
          {knownMatch && services.includes(knownMatch) ? "Already added" : "Add"}
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
  defaultOpen = false,
}: {
  services: string[];
  onToggleTest: (item: string) => void;
  onSelectAllIn: (list: readonly string[]) => void;
  customInputs: Record<string, string>;
  onCustomChange: (key: string, value: string) => void;
  onCustomAdd: (key: string) => void;
  customServiceCategories: CustomServiceCategories;
  onRemoveCustom: (key: string, value: string) => void;
  // Collapsed unless the lab IS the facility. Eighteen panels of checkboxes is
  // the longest thing in the whole form, and for a hospital or a dental clinic
  // it sits between the services they came to tick and everything after it —
  // the further someone scrolls the more likely they abandon, so a section
  // most facilities will skip should not be the one they scroll past.
  //
  // A diagnostic centre or laboratory is the opposite case: this is the point
  // of their listing, so it opens with the form.
  defaultOpen?: boolean;
}) {
  // Named param default rather than a defaultProps-style fallback, so a caller
  // that forgets the prop gets the safe (collapsed) behaviour.
  const otherKey = "basiclab-other-test";
  const [open, setOpen] = useState(defaultOpen);
  const otherDatalistId = useId();

  const selectedCount = Object.values(BASIC_LAB_CATEGORIES)
    .flat()
    .filter((test) => services.includes(test)).length;
  const otherValue = customInputs[otherKey] ?? "";
  // A value typed here that actually belongs to a panel above ticks that
  // pill instead of filing a same-named "other" entry next to it.
  const otherKnownMatch = findKnownMatch(otherValue, ALL_BASIC_LAB_TESTS);
  const submitOther = () => (otherKnownMatch ? onToggleTest(otherKnownMatch) : onCustomAdd(otherKey));

  return (
    <div className="mb-5">
      <button
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 text-left transition-colors hover:border-strong-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setOpen((value: boolean) => !value)}
        type="button"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            Basic Lab / Point-of-care Testing
          </span>
          {/* The count is the reason to open it or leave it: a facility that
              has already ticked tests needs to see that at a glance while the
              section is shut. */}
          <span className="block text-xs text-muted-foreground">
            {selectedCount > 0
              ? `${selectedCount} test${selectedCount === 1 ? "" : "s"} selected`
              : defaultOpen
                ? "Tap the tests this facility runs"
                : /* "Optional" only where it is true. For a diagnostic centre
                     the lab IS the listing, and calling it optional there
                     invites skipping the one section that matters. */
                  "Optional — tap to add lab tests"}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      {!open ? null : (
      <>
      <p className="mb-3 mt-3 text-xs text-muted-foreground">
        Tap the tests this facility runs. Use Select all when it runs a whole
        panel, and add anything missing at the bottom of each one.
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
            list={otherDatalistId}
            onChange={(e) => onCustomChange(otherKey, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submitOther();
              }
            }}
            placeholder="Add a test that doesn't fit any category above, or search all tests..."
            type="text"
            value={otherValue}
          />
          <datalist id={otherDatalistId}>
            {ALL_BASIC_LAB_TESTS.map((test) => (
              <option key={test} value={test} />
            ))}
          </datalist>
          <button
            className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
            disabled={
              !otherValue.trim() ||
              (otherKnownMatch ? services.includes(otherKnownMatch) : services.includes(otherValue.trim()))
            }
            onClick={submitOther}
            type="button"
          >
            {otherKnownMatch && services.includes(otherKnownMatch) ? "Already added" : "Add"}
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
      </>
      )}
    </div>
  );
}
