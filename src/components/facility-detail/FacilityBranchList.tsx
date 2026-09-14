"use client";

import { useId, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PhoneIcon } from "@/components/cards/contact-icons";
import { createTelHref, splitPhoneNumbers } from "@/lib/contact-actions";
import { subCityLabel } from "@/lib/format-location";
import type { FacilityBranch, FacilityScheduleRow } from "@/types/facility";

function scheduleSummary(rows: FacilityScheduleRow[]): string {
  return rows
    .filter((r) => r.days.length > 0)
    .map((r) => {
      const days = r.days.length === 7 ? "Every day" : r.days.map((d) => d.slice(0, 3)).join(", ");
      const hours = r.closed ? "Closed" : r.open === "Open 24 hours" ? "Open 24 hours" : `${r.open} – ${r.close}`;
      return `${days}: ${hours}`;
    })
    .join(" · ");
}

function BranchPhones({ phone, phone2 }: { phone: string; phone2?: string }) {
  const numbers = [phone, phone2].filter((v): v is string => Boolean(v?.trim()));
  if (numbers.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {numbers.flatMap((raw) => splitPhoneNumbers(raw)).map((num) => {
        const href = createTelHref(num);
        if (!href) return null;
        return (
          <a className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline" href={href} key={href}>
            <PhoneIcon className="size-3.5 shrink-0" />
            {num.trim()}
          </a>
        );
      })}
    </div>
  );
}

function BranchDetailRow({
  branch,
  mainServices,
  highlighted,
}: {
  branch: FacilityBranch;
  mainServices: string[];
  highlighted: boolean;
}) {
  const [open, setOpen] = useState(highlighted);
  const panelId = useId();
  const additional = branch.additionalServices ?? [];
  const hasDetail =
    Boolean(branch.phone || branch.phone_2) ||
    Boolean(branch.subCity) ||
    branch.schedule != null ||
    mainServices.length > 0 ||
    additional.length > 0;

  const excluded = branch.excludedServices ?? [];
  const servicesLine =
    mainServices.length === 0
      ? null
      : excluded.length === 0
        ? "Offers the same services as the main listing."
        : `Offers the same services as the main listing, except: ${excluded.join(", ")}. Visit the main branch for those.`;
  const additionalServicesLine =
    additional.length === 0 ? null : `Also offers here (not at the main branch): ${additional.join(", ")}.`;

  return (
    <div
      className={`border-b border-border px-2 py-2 last:border-0 ${
        highlighted ? "rounded-lg bg-primary/5 ring-1 ring-primary/30" : ""
      }`}
    >
      {highlighted ? (
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
          The branch you were shown as nearby
        </p>
      ) : null}
      <div className="flex items-center justify-between gap-2">
        <button
          aria-controls={hasDetail ? panelId : undefined}
          aria-expanded={hasDetail ? open : undefined}
          className="min-w-0 flex-1 text-left"
          disabled={!hasDetail}
          onClick={() => hasDetail && setOpen((v) => !v)}
          type="button"
        >
          <p className="flex items-center gap-1.5 text-sm text-foreground">
            <span className="min-w-0 truncate font-medium">{branch.name || branch.area}</span>
            {hasDetail ? (
              <svg aria-hidden="true" className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" />
              </svg>
            ) : null}
          </p>
          {/* area/landmark are now one merged field in the editor (see
              branch-repeater.tsx) — landmark still wins when a pre-merge
              branch has it, but area is the live fallback for anything
              edited since. Only shown here when it isn't already doing
              double duty as the line above (branch.name empty). */}
          {branch.landmark ? (
            <p className="text-xs text-muted-foreground/70">{branch.landmark}</p>
          ) : branch.name && branch.area ? (
            <p className="text-xs text-muted-foreground/70">{branch.area}</p>
          ) : null}
          {/* The chevron alone was easy to miss — nothing about a small
              rotated arrow on a text row reads as "there is more here" at a
              glance, especially on a touch screen with no hover state to
              reveal it. Spelling out what tapping reveals is a stronger,
              more standard affordance than a bigger or bolder icon would
              have been. */}
          {hasDetail && !open ? (
            <p className="mt-0.5 text-xs font-medium text-primary">Tap for phone, hours & services →</p>
          ) : null}
        </button>
        {branch.maps_link ? <a className="shrink-0 text-xs font-semibold text-primary hover:underline" href={branch.maps_link} rel="noopener noreferrer" target="_blank">Map →</a> : null}
      </div>

      {hasDetail && open ? (
        <div className="mt-2 rounded-lg bg-muted/40 p-3" id={panelId}>
          <BranchPhones phone={branch.phone} phone2={branch.phone_2} />
          {branch.subCity ? (
            <p className="mt-2 text-xs text-muted-foreground">{subCityLabel(branch.subCity)}</p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {branch.schedule != null && branch.schedule.length > 0
              ? scheduleSummary(branch.schedule)
              : "Same hours as the main listing."}
          </p>
          {servicesLine ? <p className="mt-2 text-xs text-muted-foreground">{servicesLine}</p> : null}
          {additionalServicesLine ? <p className="mt-2 text-xs text-muted-foreground">{additionalServicesLine}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

// The branch list used to be non-interactive — name, landmark and a Map
// link, nothing else — which meant a branch's own phone number (already
// being collected in the editor) had nowhere to appear, its hours could
// never be shown as different from the main listing's even when they
// genuinely were, and there was no way to say a branch's services differ
// from the main one. Each row now expands to answer those directly rather
// than sending a visitor to call and ask.
export function FacilityBranchList({
  branches,
  mainServices,
}: {
  branches: FacilityBranch[];
  mainServices: string[];
}) {
  // Set by FacilityCard when this page was reached because a specific
  // branch, not the main listing, was the nearest point on /nearby —
  // carried across as a query param since that is the only channel a plain
  // navigation between two independent pages has. Matched case-
  // insensitively against name-or-area, the same fallback BranchDetailRow's
  // own title line already uses, so it still lines up for a branch with no
  // name of its own.
  const highlightedBranch = useSearchParams().get("branch");

  return (
    <div className="flex flex-col">
      {branches.map((branch, index) => {
        const label = branch.name || branch.area;
        const highlighted = Boolean(
          highlightedBranch && label && label.toLowerCase() === highlightedBranch.toLowerCase(),
        );
        return (
          <BranchDetailRow branch={branch} highlighted={highlighted} key={index} mainServices={mainServices} />
        );
      })}
    </div>
  );
}
