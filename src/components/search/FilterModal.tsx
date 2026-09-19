"use client";

import { useEffect, useId, useState } from "react";
import { SPECIALTY_OPTIONS, SUB_CITIES } from "@/lib/constants/specialty-options";
import { EMPTY_LISTING_FILTERS, type ListingFilters } from "@/lib/listing-filters";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";
import { suggestAreas } from "@/lib/area-suggestions";

const FACILITY_TYPE_OPTIONS: { value: FacilityCategoryFilter; label: string }[] = [
  { value: "hospital", label: "General Hospital" },
  { value: "specialty", label: "Specialty Center" },
  { value: "clinic", label: "Clinic" },
  { value: "diagnostics", label: "Diagnostic Center (Lab/Imaging)" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "ambulance", label: "Ambulance Service" },
  { value: "home-care", label: "Home Care" },
];

const selectClassName =
  "min-h-12 w-full rounded-control border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelClassName = "mb-1.5 block text-sm font-semibold text-foreground";

type FilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: ListingFilters;
  onApply: (filters: ListingFilters) => void;
  onReset: () => void;
  lockedType?: FacilityCategoryFilter;
  // The free-text areas of everything the other filters (type, sub-city,
  // specialty) still allow, used to suggest neighbourhoods as one types.
  areaTexts?: (draft: ListingFilters) => string[];
  // How many results the current draft would show, for the button.
  countMatches?: (draft: ListingFilters) => number;
};

export function FilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  lockedType,
  areaTexts,
  countMatches,
}: FilterModalProps) {
  const [draft, setDraft] = useState<ListingFilters>(filters);
  const areaListId = useId();
  const [areaFocused, setAreaFocused] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);

    if (isOpen) {
      setDraft(lockedType ? { ...filters, type: lockedType } : filters);
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const areaSuggestions =
    areaTexts && areaFocused ? suggestAreas(areaTexts({ ...draft, area: "" }), draft.area) : [];
  const matchCount = countMatches ? countMatches(draft) : null;

  function handleApply() {
    onApply(draft);
    onClose();
  }

  function handleReset() {
    setDraft(lockedType ? { ...EMPTY_LISTING_FILTERS, type: lockedType } : EMPTY_LISTING_FILTERS);
    onReset();
    onClose();
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
        <div className="filter-modal-panel flex max-h-[85vh] w-full flex-col overflow-y-auto rounded-t-3xl bg-card p-5 sm:max-h-[85vh] sm:max-w-lg sm:rounded-card sm:p-6 sm:shadow-2xl">
          <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-border sm:hidden" />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            <button
              aria-label="Close"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={onClose}
              type="button"
            >
              ×
            </button>
          </div>

          <div className="mt-4 grid gap-4">
            <div>
              <label className={labelClassName} htmlFor="filter-type">
                Type of care
              </label>
              <select
                className={selectClassName}
                disabled={Boolean(lockedType)}
                id="filter-type"
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    type: event.target.value as FacilityCategoryFilter | "",
                    specialty: event.target.value === "specialty" ? current.specialty : "",
                  }))
                }
                value={draft.type}
              >
                <option value="">All types</option>
                {FACILITY_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {draft.type === "specialty" ? (
              <div>
                <label className={labelClassName} htmlFor="filter-specialty">
                  Specialty
                </label>
                <select
                  className={selectClassName}
                  id="filter-specialty"
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, specialty: event.target.value }))
                  }
                  value={draft.specialty}
                >
                  <option value="">All specialties</option>
                  {SPECIALTY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <label className={labelClassName} htmlFor="filter-sub-city">
                Sub-city
              </label>
              <select
                className={selectClassName}
                id="filter-sub-city"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, subCity: event.target.value }))
                }
                value={draft.subCity}
              >
                <option value="">All sub-cities</option>
                {SUB_CITIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClassName} htmlFor="filter-area">
                Neighbourhood / Area
              </label>
              {/* Browser autofill is off: the phone remembered long addresses
                  typed into other "area" boxes (the onboarding form) and
                  offered them here. The suggestions below come from the
                  facilities themselves, split into place names, with how
                  many facilities mention each. The old list repeated the
                  sub-city names, which the Sub-city filter already covers. */}
              <div className="relative">
                <input
                  aria-autocomplete="list"
                  aria-controls={areaListId}
                  aria-expanded={areaSuggestions.length > 0}
                  autoComplete="off"
                  className={selectClassName}
                  id="filter-area"
                  onBlur={() => window.setTimeout(() => setAreaFocused(false), 150)}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, area: event.target.value }))
                  }
                  onFocus={() => setAreaFocused(true)}
                  placeholder="e.g. CMC, Sarbet, Lebu, Megenagna"
                  role="combobox"
                  type="search"
                  value={draft.area}
                />
                {areaSuggestions.length > 0 && (
                  <ul
                    className="absolute inset-x-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-control border border-border bg-card py-1 shadow-lg"
                    id={areaListId}
                    role="listbox"
                  >
                    {areaSuggestions.map((suggestion) => (
                      <li aria-selected="false" key={suggestion.label} role="option">
                        <button
                          className="flex min-h-11 w-full items-center justify-between gap-3 px-4 text-left text-sm text-foreground hover:bg-muted"
                          onClick={() => {
                            setDraft((current) => ({ ...current, area: suggestion.label }));
                            setAreaFocused(false);
                          }}
                          onMouseDown={(event) => event.preventDefault()}
                          type="button"
                        >
                          <span className="min-w-0 truncate">{suggestion.label}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {suggestion.count} {suggestion.count === 1 ? "place" : "places"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Matches the neighbourhood, landmark or address a facility lists.
              </p>
            </div>
          </div>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            Leave any filter blank to include all options for that field.
            Hit <span className="font-semibold">Reset</span> to clear all filters.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              className="min-h-12 flex-1 rounded-control border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:border-strong-border"
              onClick={handleReset}
              type="button"
            >
              Reset
            </button>
            <button
              className="min-h-12 flex-1 rounded-control bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
              onClick={handleApply}
              type="button"
            >
              {matchCount === null
                ? "Show results"
                : matchCount === 0
                  ? "No matches"
                  : `Show ${matchCount} ${matchCount === 1 ? "result" : "results"}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
