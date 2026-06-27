"use client";

import { useEffect, useState } from "react";
import { SPECIALTY_OPTIONS, SUB_CITIES } from "@/lib/constants/specialty-options";
import { EMPTY_LISTING_FILTERS, type ListingFilters } from "@/lib/listing-filters";
import type { FacilityCategoryFilter } from "@/lib/frontend-search-filters";

const FACILITY_TYPE_OPTIONS: { value: FacilityCategoryFilter; label: string }[] = [
  { value: "hospital", label: "General Hospital" },
  { value: "specialty", label: "Specialty Center" },
  { value: "clinic", label: "Clinic" },
  { value: "diagnostics", label: "Diagnostic Center" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "ambulance", label: "Ambulance Service" },
  { value: "home-care", label: "Home Care" },
];

const selectClassName =
  "min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelClassName = "mb-1.5 block text-sm font-semibold text-foreground";

type FilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: ListingFilters;
  onApply: (filters: ListingFilters) => void;
  onReset: () => void;
  lockedType?: FacilityCategoryFilter;
};

export function FilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  lockedType,
}: FilterModalProps) {
  const [draft, setDraft] = useState<ListingFilters>(filters);
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
        <div className="filter-modal-panel flex max-h-[85vh] w-full flex-col overflow-y-auto rounded-t-3xl bg-card p-5 sm:max-h-[85vh] sm:max-w-lg sm:rounded-3xl sm:p-6 sm:shadow-2xl">
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
              <input
                autoComplete="on"
                className={selectClassName}
                id="filter-area"
                list="filter-area-options"
                name="area"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, area: event.target.value }))
                }
                placeholder="e.g. Bole, Sarbet, CMC, Lebu..."
                type="text"
                value={draft.area}
              />
              <datalist id="filter-area-options">
                {SUB_CITIES.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
          </div>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            Leave any filter blank to include all options for that field.
            Hit <span className="font-semibold">Reset</span> to clear all filters.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              className="min-h-12 flex-1 rounded-xl border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:border-strong-border"
              onClick={handleReset}
              type="button"
            >
              Reset
            </button>
            <button
              className="min-h-12 flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
              onClick={handleApply}
              type="button"
            >
              Show results
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
