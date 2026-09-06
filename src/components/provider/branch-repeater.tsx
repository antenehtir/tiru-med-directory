"use client";

import type { ReactNode } from "react";
import { judgeGpsFix } from "@/lib/provider/geolocation";
import type { FacilityBranch } from "@/types/facility";

// The branch list, extracted from Step2LocationForm so the admin facility
// editor can reuse it rather than growing a second implementation. Purely
// controlled: it holds no state, talks to no server action, and knows nothing
// about facility_claims — every change leaves through onChange and the caller
// decides what that means. Onboarding autosaves it; the admin editor stages it
// behind a snapshot-diff guard.
//
// `value` is the ADDITIONAL sites only, never the main listing — the facility
// row itself is site one. Live data confirms the convention: the one row with
// branch_count set reads 1 with an empty branches array, and onboarding renders
// branchCount - 1 blocks. So total sites = value.length + 1.

export function emptyBranch(): FacilityBranch {
  return { name: "", area: "", landmark: "", latitude: null, longitude: null, maps_link: "", phone: "" };
}

// A branch is real once it says where it is. A name alone ("Bole Branch") or an
// area alone is enough to be worth keeping; an entry with neither is a block
// someone has not filled in yet, not data. Callers use this to decide what to
// persist — the blank blocks stay on screen either way so there is somewhere to
// type. Writing unfiltered blanks is what previously put rows of empty branch
// objects into facility_claims.
export function hasBranchContent(branch: FacilityBranch): boolean {
  return branch.name.trim().length > 0 || branch.area.trim().length > 0;
}

type BranchRepeaterProps = {
  value: FacilityBranch[];
  // Fires on every keystroke — keep the controlled value in sync with it.
  onChange: (next: FacilityBranch[]) => void;
  // Fires on blur, and on structural edits (add / remove / pin captured).
  // Split from onChange because onboarding autosaves branches and saving on
  // every character would hammer the server; it saved on blur before this
  // component existed and still does. A caller that stages edits behind its
  // own save button (the admin editor) can ignore this entirely.
  onCommit?: (next: FacilityBranch[]) => void;
  // Total sites including the main listing. Undefined means unbounded — the
  // caller allows as many as the user wants to add.
  maxBranches?: number;
  // Offers "use my current location" as a bare button on each branch. Only
  // for callers with no coordinate editor: onboarding turns it on because
  // otherwise a provider has no way to locate a branch at all. Admin leaves it
  // off — not because GPS is wrong there, but because the MapPinPicker it
  // passes as the coordinate editor already offers it, with a confirmation map
  // this button has no room for.
  allowGeolocation?: boolean;
  // Optional per-branch coordinate editor. Kept as a slot so this component
  // stays free of Leaflet: the admin editor passes a MapPinPicker here,
  // reusing the same picker as the primary location rather than adding a
  // third map implementation, while onboarding passes nothing and relies on
  // its geolocation button instead.
  renderCoordinateEditor?: (
    branch: FacilityBranch,
    index: number,
    setCoordinates: (lat: number, lng: number, mapsLink?: string) => void,
  ) => ReactNode;
  heading?: string;
  description?: string;
};

export function BranchRepeater({
  value,
  onChange,
  onCommit,
  maxBranches,
  allowGeolocation = false,
  renderCoordinateEditor,
  heading = "Branch Locations",
  description,
}: BranchRepeaterProps) {
  const unbounded = maxBranches === undefined || maxBranches === 99;
  const allowedExtra = unbounded ? Infinity : Math.max(0, maxBranches - 1);
  const canAdd = value.length < allowedExtra;
  const remaining = unbounded ? 0 : allowedExtra - value.length;

  function update(index: number, partial: Partial<FacilityBranch>) {
    const next = [...value];
    next[index] = { ...next[index], ...partial };
    onChange(next);
    return next;
  }

  function commit(next: FacilityBranch[]) {
    onCommit?.(next);
  }

  function captureLocation(index: number) {
    if (!("geolocation" in navigator)) return;
    const confirmed = window.confirm(
      "Only use this if you are physically standing at this branch's entrance right now. Continue?",
    );
    if (!confirmed) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        // This path checked nothing before — not the accuracy, not even that
        // the point was in Addis — so a Wi-Fi fix went straight into a branch.
        const verdict = judgeGpsFix(latitude, longitude, accuracy);
        if (!verdict.ok) {
          alert(verdict.message);
          return;
        }
        commit(
          update(index, {
            latitude,
            longitude,
            maps_link: `https://www.google.com/maps?q=${latitude},${longitude}`,
          }),
        );
      },
      () => alert("Could not get location. Please paste a Google Maps link instead."),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">{heading}</h2>
          <p className="text-sm text-muted-foreground">
            {description ??
              (unbounded
                ? "Add each branch location below"
                : `Add details for your ${allowedExtra} additional ${allowedExtra === 1 ? "branch" : "branches"}`)}
          </p>
        </div>
        {canAdd && (
          <button
            className="shrink-0 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10"
            onClick={() => {
              const next = [...value, emptyBranch()];
              onChange(next);
              commit(next);
            }}
            type="button"
          >
            + Add branch
          </button>
        )}
      </div>

      <div className="space-y-6">
        {value.map((branch, i) => (
          <div key={i} className="rounded-xl border border-border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Branch {i + 2}
                {branch.name ? ` — ${branch.name}` : ""}
              </p>
              <button
                className="text-xs text-red-500 hover:text-red-600"
                onClick={() => {
                  const next = value.filter((_, idx) => idx !== i);
                  onChange(next);
                  commit(next);
                }}
                type="button"
              >
                Remove
              </button>
            </div>

            <div className="space-y-3">
              <BranchField
                label="Branch name or identifier"
                onChange={(v) => update(i, { name: v })}
                onCommit={(v) => commit(update(i, { name: v }))}
                placeholder="e.g. Bole Branch, Main Branch"
                value={branch.name}
              />
              <BranchField
                label="Area / neighborhood"
                onChange={(v) => update(i, { area: v })}
                onCommit={(v) => commit(update(i, { area: v }))}
                placeholder="e.g. Bole Medhanialem"
                value={branch.area}
              />
              <BranchField
                label="Nearby landmark"
                onChange={(v) => update(i, { landmark: v })}
                onCommit={(v) => commit(update(i, { landmark: v }))}
                placeholder="e.g. next to Edna Mall"
                value={branch.landmark}
              />
              {/* Only when there is no coordinate editor. A caller that passes
                  one already offers a maps-link box inside it, and that one
                  resolves the link to a latitude and longitude before storing
                  it. Showing both put two identical-looking paste bars in the
                  same block where only the lower one produced coordinates —
                  a link pasted into this field would leave the branch looking
                  located while staying invisible to distance search. */}
              {!renderCoordinateEditor && (
                <BranchField
                  help="Paste the Google Maps link for this branch entrance"
                  label="Google Maps link"
                  onChange={(v) => update(i, { maps_link: v })}
                  onCommit={(v) => commit(update(i, { maps_link: v }))}
                  placeholder="https://maps.app.goo.gl/..."
                  type="url"
                  value={branch.maps_link}
                />
              )}
              <BranchField
                label="Branch phone number"
                onChange={(v) => update(i, { phone: v })}
                onCommit={(v) => commit(update(i, { phone: v }))}
                placeholder="+251 ..."
                type="tel"
                value={branch.phone ?? ""}
              />

              {renderCoordinateEditor?.(branch, i, (lat, lng, link) =>
                commit(
                  update(i, {
                    latitude: lat,
                    longitude: lng,
                    maps_link: link ?? `https://www.google.com/maps?q=${lat},${lng}`,
                  }),
                ),
              )}

              {branch.latitude != null && branch.longitude != null && (
                <p className="text-xs text-muted-foreground">
                  Pinned at {branch.latitude}, {branch.longitude}
                </p>
              )}

              {allowGeolocation && (
                <button
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  onClick={() => captureLocation(i)}
                  type="button"
                >
                  📍{" "}
                  {branch.latitude != null && branch.longitude != null
                    ? "Pin captured — update location"
                    : "Use my current location for this branch"}
                </button>
              )}
            </div>
          </div>
        ))}

        {!unbounded && remaining > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {remaining} more {remaining === 1 ? "branch" : "branches"} to add
          </p>
        )}

        {value.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Click &quot;+ Add branch&quot; to add {unbounded ? "your first additional branch" : "a branch"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BranchField({
  label,
  value,
  onChange,
  onCommit,
  placeholder,
  type = "text",
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onCommit?: (value: string) => void;
  placeholder?: string;
  type?: string;
  help?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        onBlur={(e) => onCommit?.(e.target.value)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}
