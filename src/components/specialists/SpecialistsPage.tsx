"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import type { SpecialistListItem } from "@/lib/supabase/get-specialists";
import { SpecialistCard } from "./SpecialistCard";
import {
  EMPTY_SPECIALIST_FILTERS,
  SpecialistFilterModal,
  type SpecialistFilters,
} from "./SpecialistFilterModal";

const ALL_SPECIALTIES_LABEL = "All specialists";

function matchesSearch(specialist: SpecialistListItem, query: string): boolean {
  if (!query) return true;
  const haystack = [
    specialist.fullName,
    specialist.specialty,
    specialist.subspecialty,
    specialist.facilityName,
    specialist.facilityArea,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function matchesFilters(specialist: SpecialistListItem, filters: SpecialistFilters): boolean {
  if (filters.language && !specialist.languages.includes(filters.language)) return false;
  if (
    filters.subCity &&
    specialist.facilitySubCity.toLowerCase() !== filters.subCity.toLowerCase()
  )
    return false;
  if (
    filters.facilityType &&
    specialist.facilityCategory.toLowerCase() !== filters.facilityType.toLowerCase()
  )
    return false;
  return true;
}

export function SpecialistsPage({ specialists }: { specialists: SpecialistListItem[] }) {
  const [query, setQuery] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState(ALL_SPECIALTIES_LABEL);
  const [filters, setFilters] = useState<SpecialistFilters>(EMPTY_SPECIALIST_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const specialtyPills = useMemo(() => {
    const seen = new Set<string>();
    const pills: string[] = [];
    for (const specialist of specialists) {
      const label = specialist.specialty.trim();
      if (!label || seen.has(label)) continue;
      seen.add(label);
      pills.push(label);
    }
    pills.sort((a, b) => a.localeCompare(b));
    return [ALL_SPECIALTIES_LABEL, ...pills];
  }, [specialists]);

  const visibleSpecialists = useMemo(() => {
    return specialists.filter((specialist) => {
      if (activeSpecialty !== ALL_SPECIALTIES_LABEL && specialist.specialty !== activeSpecialty) {
        return false;
      }
      if (!matchesSearch(specialist, query)) return false;
      if (!matchesFilters(specialist, filters)) return false;
      return true;
    });
  }, [specialists, activeSpecialty, query, filters]);

  return (
    <PageContainer className="py-8 sm:py-10 lg:py-14">
      <div className="grid gap-6">
        <header className="max-w-3xl">
          <p className="mb-3 inline-flex rounded-full border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground">
            Specialists directory
          </p>
          <h1 className="text-3xl font-semibold leading-[1.08] text-foreground sm:text-4xl">
            Find trusted specialists by specialty.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            {specialists.length} specialist{specialists.length === 1 ? "" : "s"} across Addis
            Ababa.
          </p>
        </header>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-[0_12px_30px_rgba(17,24,39,0.025)]">
          <p className="text-sm font-semibold text-foreground">Specialty filters</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {specialtyPills.map((label) => {
              const isActive = label === activeSpecialty;
              return (
                <button
                  className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-strong-border"
                  }`}
                  key={label}
                  onClick={() => setActiveSpecialty(label)}
                  type="button"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              className="min-h-12 w-full rounded-xl border border-border bg-card px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, specialty, or facility..."
              type="search"
              value={query}
            />
          </div>
          <button
            className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-strong-border"
            onClick={() => setIsFilterModalOpen(true)}
            type="button"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <SpecialistFilterModal
          filters={filters}
          isOpen={isFilterModalOpen}
          onApply={setFilters}
          onClose={() => setIsFilterModalOpen(false)}
          onReset={() => setFilters(EMPTY_SPECIALIST_FILTERS)}
        />

        {visibleSpecialists.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleSpecialists.map((specialist) => (
              <SpecialistCard key={specialist.id} specialist={specialist} />
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            No specialists found — try different filters.
          </p>
        )}
      </div>
    </PageContainer>
  );
}
