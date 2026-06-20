"use client";

import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { specialtySubFilters } from "@/lib/frontend-search-filters";

type SpecialtyFilterDropdownProps = {
  activeSpecialty?: string;
};

export function SpecialtyFilterDropdown({
  activeSpecialty = "",
}: SpecialtyFilterDropdownProps) {
  const router = useRouter();
  const selectedValue = activeSpecialty || "All specialties";

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const params = new URLSearchParams({ category: "specialty" });

    if (value !== "All specialties") {
      params.set("specialty", value);
    }

    router.push(`/facilities?${params.toString()}`);
  }

  return (
    <div className="max-w-xs">
      <label
        className="mb-1.5 block text-sm font-medium text-foreground"
        htmlFor="specialty-filter-dropdown"
      >
        Filter by specialty
      </label>
      <select
        className="min-h-11 w-full rounded-xl border border-border bg-card px-4 text-sm text-foreground outline-none transition focus:border-strong-border"
        id="specialty-filter-dropdown"
        onChange={handleChange}
        value={selectedValue}
      >
        {specialtySubFilters.map((sub) => (
          <option key={sub} value={sub}>
            {sub}
          </option>
        ))}
      </select>
    </div>
  );
}
