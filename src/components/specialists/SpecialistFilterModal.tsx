"use client";

import { useEffect, useState } from "react";
import { SUB_CITIES } from "@/lib/constants/specialty-options";
import { DOCTOR_LANGUAGES } from "@/lib/provider/doctor-types";

export type SpecialistFilters = {
  language: string;
  subCity: string;
  facilityType: string;
};

export const EMPTY_SPECIALIST_FILTERS: SpecialistFilters = {
  language: "",
  subCity: "",
  facilityType: "",
};

const FACILITY_TYPE_OPTIONS = [
  "General Hospital",
  "Specialty Center",
  "Clinic",
  "Diagnostic Center",
  "Pharmacy",
  "Ambulance Service",
  "Home Care",
];

const selectClassName =
  "min-h-12 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelClassName = "mb-1.5 block text-sm font-semibold text-foreground";

type SpecialistFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: SpecialistFilters;
  onApply: (filters: SpecialistFilters) => void;
  onReset: () => void;
};

export function SpecialistFilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
}: SpecialistFilterModalProps) {
  const [draft, setDraft] = useState<SpecialistFilters>(filters);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setDraft(filters);
  }

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleApply() {
    onApply(draft);
    onClose();
  }

  function handleReset() {
    setDraft(EMPTY_SPECIALIST_FILTERS);
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
              <label className={labelClassName} htmlFor="filter-language">
                Language spoken
              </label>
              <select
                className={selectClassName}
                id="filter-language"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, language: event.target.value }))
                }
                value={draft.language}
              >
                <option value="">Any language</option>
                {DOCTOR_LANGUAGES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

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
              <label className={labelClassName} htmlFor="filter-facility-type">
                Facility type
              </label>
              <select
                className={selectClassName}
                id="filter-facility-type"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, facilityType: event.target.value }))
                }
                value={draft.facilityType}
              >
                <option value="">All facility types</option>
                {FACILITY_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
