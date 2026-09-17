"use client";

// "Select all" / "Deselect all" for a multiple-choice pill list, styled like
// the ones the onboarding wizard already has. Values outside `options` (typed
// under "Other", or stored before the list existed) are never touched:
// selecting all adds to them, deselecting all leaves them in place.
//
// "Other" is never part of "all": it is a choice someone makes on purpose,
// usually with a box to fill in, not one of the things being selected.
export function SelectAllButton({
  options,
  selected,
  onChange,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const selectable = options.filter((o) => !/^other\b/i.test(o));
  const allSelected = selectable.length > 0 && selectable.every((o) => selected.includes(o));

  return (
    <button
      className="shrink-0 text-xs text-primary hover:underline"
      onClick={() =>
        onChange(
          allSelected
            ? selected.filter((v) => !selectable.includes(v))
            : [...selected, ...selectable.filter((o) => !selected.includes(o))],
        )
      }
      type="button"
    >
      {allSelected ? "Deselect all" : "Select all"}
    </button>
  );
}
