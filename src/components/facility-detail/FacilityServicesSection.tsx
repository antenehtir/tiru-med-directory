"use client";

import { useId, useState } from "react";
import { Pill } from "@/components/ui/Pill";
import { CollapsiblePillList } from "./CollapsiblePillList";
import { CollapsibleServiceGroup } from "./CollapsibleServiceGroup";
import { groupFacilityServices, sortByFrequency } from "@/lib/facility/service-groups";
import { absorbCompoundSpecialties, getFacilityMedicalSpecialties } from "@/lib/facility/specialty-display";
import { matchesQueryTokens, splitQueryTokens } from "@/lib/frontend-search-filters";
import type { Facility } from "@/types/facility";

type FacilityServicesSectionProps = {
  facility: Facility;
  // How many active facilities directory-wide carry each service string —
  // used to lead every list with what's common ("General OPD / Outpatient
  // consultation") rather than whatever order this one facility's own
  // stored array happens to hold, which is usually just edit history.
  // Missing values rank last, which is also correct for a value nothing
  // else in the directory carries.
  serviceFrequency?: Record<string, number>;
};

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

// Every named section this facility page can show, flattened to
// {label, items} pairs — the lab's two levels collapse into one, tagged with
// the panel name, since a searcher typing "CBC" cares which panel has it,
// not that the parent section is called "Laboratory tests".
type SearchableSection = { label: string; items: string[] };

function buildSearchIndex(
  medicalSpecialties: string[],
  groups: ReturnType<typeof groupFacilityServices>,
): SearchableSection[] {
  const sections: SearchableSection[] = [];
  if (medicalSpecialties.length > 0) {
    sections.push({ label: "Clinical specialties", items: medicalSpecialties });
  }
  for (const group of groups) {
    if (group.subgroups) {
      for (const sub of group.subgroups) sections.push({ label: sub.label, items: sub.services });
    } else if (group.services.length > 0) {
      sections.push({ label: group.label, items: group.services });
    }
  }
  return sections;
}

export function FacilityServicesSection({ facility, serviceFrequency = {} }: FacilityServicesSectionProps) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const rank = (items: string[]) => sortByFrequency(items, serviceFrequency);
  const groups = groupFacilityServices(facility).map((group) => ({
    ...group,
    services: rank(group.services),
    subgroups: group.subgroups?.map((sub) => ({ ...sub, services: rank(sub.services) })),
  }));
  const medicalSpecialties = rank(
    absorbCompoundSpecialties(getFacilityMedicalSpecialties(facility.services)),
  );
  // Matches AdminFacilityServicesEditor's isDiagnostic gate — same category
  // string, same reasoning: this is the one facility type whose page IS the
  // lab, so the panel list should not cost a visitor an extra tap to see.
  const isDiagnosticCenter = facility.category === "Diagnostic Center";
  const generalServicesGroup = groups.find((g) => g.label === "General Services" && !g.subgroups);
  const otherGroups = groups.filter((g) => g !== generalServicesGroup);

  if (groups.length === 0 && medicalSpecialties.length === 0) return null;

  const trimmedQuery = query.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;
  // Built either way, but only walked when a query exists — computing it up
  // front rather than inside a useMemo is fine here: the list a facility page
  // carries tops out in the hundreds of strings, not a size where this costs
  // anything a visitor would notice.
  // Same matcher /search and the header dropdown already use, word-boundary
  // prefixes and typo tolerance included — this used to be a plain substring
  // check, which is why typing "optalmology" here found nothing on a
  // facility that lists "Ophthalmology": a substring scan has no notion of a
  // dropped letter, only the shared matcher does.
  const searchTokens = splitQueryTokens(trimmedQuery);
  const searchResults = isSearching
    ? buildSearchIndex(medicalSpecialties, groups)
        .map((section) => ({
          label: section.label,
          items: section.items.filter((item) => matchesQueryTokens(item, searchTokens)),
        }))
        .filter((section) => section.items.length > 0)
    : [];

  return (
    <section className="rounded-card border border-border bg-card p-5 shadow-[0_10px_26px_rgba(31,41,55,0.04)] sm:p-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Services & specialties</p>
        <h2 className="mt-1 font-display text-xl font-semibold leading-tight text-foreground sm:text-2xl">
          Care available at this facility
        </h2>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Review the services and clinical areas listed for this provider.
        </p>
      </div>

      <div className="relative mt-4 max-w-sm">
        <label className="sr-only" htmlFor={inputId}>Search this facility&apos;s services and specialties</label>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><SearchIcon /></span>
        <input
          className="min-h-11 w-full rounded-control border border-border bg-background pl-9 pr-9 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          id={inputId}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search this facility's services..."
          type="text"
          value={query}
        />
        {query ? (
          <button
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => setQuery("")}
            type="button"
          >
            ×
          </button>
        ) : null}
      </div>

      {isSearching ? (
        <div className="mt-5 grid gap-5">
          {searchResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No service or specialty here matches &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            searchResults.map((section) => (
              <div key={section.label}>
                <p className="mb-2.5 text-sm font-semibold text-foreground">{section.label}</p>
                <div className="flex flex-wrap gap-2">
                  {section.items.map((item) => (
                    <Pill key={item} variant="default">{item}</Pill>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="mt-5 grid gap-5">
          {/* General Services leads, then Clinical specialties, then
              everything else in its usual order (lab, imaging, ...). A
              general service is what most visitors are actually here to
              confirm ("do they do maternity care") — the specialty list
              answers a narrower question and used to make every visitor
              scroll past it first regardless of which one brought them. */}
          {generalServicesGroup ? (
            <CollapsiblePillList items={generalServicesGroup.services} label={generalServicesGroup.label} />
          ) : null}
          <CollapsiblePillList items={medicalSpecialties} label="Clinical specialties" />

          {otherGroups.map((group) =>
            group.subgroups ? (
              <CollapsibleServiceGroup
                defaultOpen={isDiagnosticCenter}
                key={group.label}
                label={group.label}
                subgroups={group.subgroups}
              />
            ) : (
              <CollapsiblePillList items={group.services} key={group.label} label={group.label} />
            ),
          )}
        </div>
      )}
    </section>
  );
}
